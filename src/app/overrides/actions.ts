'use server'
import pool from "@/lib/db";
import logger from "@/lib/logger";
import { getSession, getStatementById, processStatement } from "../actions";
import { DbStatement } from "../types/types";
import { Override } from "@/components/override/override-table";
import { Transaction, Statement } from "../types/types";
import { getInsights } from "../utils/dataProcessing";

export async function getAllCachedMerchantCategories(userId: string): Promise<Record<string, string>> {
    try {
        if (!userId) return {};
        const cached: Record<string, string> = {};
        const res = await pool.query(
            'SELECT merchant, category FROM merchant_categories WHERE user_id = $1',
            [userId]
        );
        logger.info(`Fetched ${res.rows.length} cached merchant categories for user: ${userId}`);
        res.rows.forEach(row => {
            cached[row.merchant] = row.category;
        })
        return cached;
    } catch (error) {
        logger.error(`Error fetching all cached merchant categories: ${JSON.stringify(error, null, 2)}`);
        return {} as Record<string, string>;
    }
}

export async function applyOverride(userId: string, merchant: string, category: string) {
    if (!userId || !merchant || !category) {
        const message = 'User, merchant, and category are required to apply an override';
        logger.warn(message);
        return { success: false, message };
    }

    try {
        const result = await pool.query(
            `INSERT INTO merchant_categories (user_id, merchant, category)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, merchant)
             DO UPDATE SET category = EXCLUDED.category, updated_at = CURRENT_TIMESTAMP
             RETURNING merchant, category`,
            [userId, merchant, category]
        );

        const appliedCategory = result.rows[0]?.category;
        logger.info(`Applied override for merchant ${merchant} to category ${appliedCategory} for user ${userId}`);
        return { success: true, message: 'Override applied successfully', category: appliedCategory };
    } catch (error) {
        logger.error(`Error applying override: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to apply override' };
    }
}

export async function applyAllOverrides(userId: string, overrides: Record<string, string>) {
    try {
        if (!userId) {
            const message = 'User is required to apply overrides';
            logger.warn(message);
            return { success: false, message };
        }

        if (!overrides || Object.keys(overrides).length === 0) {
            const message = 'No overrides provided';
            logger.warn(message);
            return { success: false, message };
        }

        const oldCached = await getAllCachedMerchantCategories(userId);
        const entries = Object.entries(overrides);
        const values = entries
            .map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`)
            .join(', ');
        const params: (string)[] = [];
        entries.forEach(([merchant, category]) => {
            params.push(userId, merchant, category);
        });

        await pool.query(
            `INSERT INTO merchant_categories (user_id, merchant, category)
             VALUES ${values}
             ON CONFLICT (user_id, merchant)
             DO UPDATE SET category = EXCLUDED.category, updated_at = CURRENT_TIMESTAMP`,
            params
        );

        const newCached = await getAllCachedMerchantCategories(userId);
        const overridesApplied = entries
            .filter(([merchant]) => oldCached[merchant] !== newCached[merchant])
            .map(([merchant]) => merchant);

        logger.info(`Overrides applied: ${JSON.stringify(overridesApplied, null, 2)}`);
        return { success: true, message: 'All overrides applied successfully', overridesApplied };
    } catch (error) {
        logger.error(`Error applying all overrides: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to apply overrides' };
    }
}

export async function updateStatementOverride(userId: string, statement: DbStatement) {
    try {
        if (!userId || !statement) {
            const message = 'User and statement are required to reprocess a statement after an override';
            logger.warn(message);
            return { success: false, message };
        }
        const transactions = Array.isArray(statement?.data?.transactions) ? statement.data.transactions : [];
        const uniqueMerchants = [... new Set(transactions.map((t: any) => t.Merchant))];
        const response = await processStatement(userId, transactions, uniqueMerchants, statement.data?.fileName || 'Unknown');
        const statementId = statement.id;
        await pool.query(
            `UPDATE transaction_records SET data = $1 WHERE id = $2`,
            [JSON.stringify(response), statementId]
        );

        logger.info(`Updated statement ${statementId} with new data after override`);
        return { success: true, message: 'Statement updated successfully' };
    } catch (error) {
        logger.error(`Error reprocessing statement after override: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to reprocess statement after override' };
    }
}

async function ensureStatementMerchantMapTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS statement_merchants (
            user_id TEXT NOT NULL,
            statement_id BIGINT NOT NULL,
            merchant TEXT NOT NULL,
            PRIMARY KEY (user_id, statement_id, merchant)
        );
    `);
}

async function upsertStatementMerchantMap(userId: string, statementId: string, merchants: string[]) {
    if (!merchants.length) return;
    await ensureStatementMerchantMapTable();

    const values = merchants.map((_, index) => `($1, $2, $${index + 3})`).join(', ');
    const params = [userId, statementId, ...merchants];

    await pool.query(
        `INSERT INTO statement_merchants (user_id, statement_id, merchant)
         VALUES ${values}
         ON CONFLICT (user_id, statement_id, merchant) DO NOTHING`,
        params
    );
}

async function syncStatementMerchantMap(userId: string) {
    const res = await pool.query(
        'SELECT id, data FROM transaction_records WHERE user_id = $1',
        [userId]
    );

    for (const row of res.rows) {
        const merchants = Object.keys(row.data?.categories || {});
        await upsertStatementMerchantMap(userId, String(row.id), merchants);
    }
}

async function getStatementIdsForMerchants(userId: string, merchants: string[]): Promise<string[]> {
    if (!merchants.length) return [];
    await ensureStatementMerchantMapTable();
    const res = await pool.query(
        `SELECT DISTINCT statement_id FROM statement_merchants
         WHERE user_id = $1 AND merchant = ANY($2)`,
        [userId, merchants]
    );
    return res.rows.map((r: any) => String(r.statement_id));
}

export async function reprocessStatementsAfterOverride(userId?: string, overrides?: Record<string, string>) {
    try {
        const session = await getSession();
        const effectiveUser = userId || session?.user?.email;
        if (!effectiveUser) {
            const message = 'User is required to reprocess statements after overrides';
            logger.warn(message);
            return { success: false, message };
        }

        const merchantsToUpdate = overrides ? Object.keys(overrides) : [];

        await syncStatementMerchantMap(effectiveUser);

        const statementIds = merchantsToUpdate.length > 0
            ? await getStatementIdsForMerchants(effectiveUser, merchantsToUpdate)
            : [];

        if (statementIds.length === 0) {
            logger.info('No statements require reprocessing for the provided overrides');
            return { success: true, message: 'No statements to reprocess', updatedStatements: [] };
        }

        const statementsRes = await pool.query(
            'SELECT id, data, file_name FROM transaction_records WHERE user_id = $1 AND id = ANY($2)',
            [effectiveUser, statementIds]
        );

        const updated: string[] = [];
        for (const row of statementsRes.rows) {
            const statement: DbStatement = {
                id: String(row.id),
                file_name: row.file_name,
                created_at: row.data?.created_at,
                data: row.data,
            };
            const result = await updateStatementOverride(effectiveUser, statement);
            if (result?.success) updated.push(statement.id);
        }

        return { success: true, message: 'Statements reprocessed', updatedStatements: updated };
    } catch (error) {
        logger.error(`Error reprocessing statements after overrides: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to reprocess statements after overrides' };
    }
}


export async function getMerchantsForDataTable(userId: string): Promise<Override[]> {
    try {
        if (!userId) return []
        const result: any[] = []
        const res = await pool.query(
            'SELECT id, merchant, category, created_at, updated_at FROM merchant_categories WHERE user_id = $1',
            [userId]
        );
        res.rows.forEach(row => {
            result.push({
                id: row.id,
                merchant: row.merchant,
                category: row.category,
                created_at: row.created_at,
                updated_at: row.updated_at
            })  
        })
        logger.info(`Fetched ${res.rows.length} cached merchant categories for user: ${userId}`)
        return result;
    } catch (error) {
        logger.error(`Error fetching all cached merchant categories: ${JSON.stringify(error, null, 2)}`);
        return [] as any[];
    }
}

// ACCOUNTS RECIEVABLES 
// GOAL: Be able to modify the total spend attribute for any given statement by grabbing a list of transactions for that month and 
// entering how much you may have recieved for that transaction if it was for someone else. Then, recalculate the total spend for that statement. 

export async function grabAllTransactionsForStatement(statementId: number) {
    try {
        const statement = await getStatementById(Number(statementId));
        if (!statement) {
            return { success: false, message: 'Statement not found' };
        }
        logger.info(`Statement: ${JSON.stringify(statement, null, 2)}`);
        const transactions = Array.isArray(statement.data?.transactions) ? statement.data.transactions : [];
        return { success: true, transactions };
    } catch (error) {
        logger.error(`Error grabbing all transactions for statement: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to grab all transactions for statement' };
    }
}

export async function updateTransasctionAccRec(statementId: number, transactionInput: Transaction, accRecAmount: number) {
    try {
        if(!statementId || !transactionInput) {
            return {
                success: false,
                message: 'Invalid statement ID, transaction index, or acc rec amount'
            }
        }
        logger.info(`Updating transaction ${transactionInput.Merchant} with acc rec amount ${accRecAmount} for statement ${statementId}`);
        const session = await getSession();
        if(!session) {
            return {
                success: false,
                message: 'Unauthorized'
            }
        }
        const statementResult = await getStatementById(Number(statementId));
        if(!statementResult) {
            return {
                success: false,
                message: 'Statement not found'
            }
        }
        const statement = statementResult.data;
        const transactions = Array.isArray(statement.transactions) ? statement.transactions : [];
        const merchants = [...new Set(statement.transactions.map((t: Transaction) => t.Merchant))];
        logger.info(`Merchants: ${JSON.stringify(merchants, null, 2)}`);

        const transactionIdx = transactions.findIndex(
            (t: Transaction) =>
                t.Date === transactionInput.Date &&
                t.Amount === transactionInput.Amount &&
                t.Merchant === transactionInput.Merchant
        );
        
        if (transactionIdx === -1) {
            logger.warn(`Transaction not found: ${transactionInput.Merchant}`);
            logger.warn(`Looking for: Date=${transactionInput.Date}, Amount=${transactionInput.Amount}, Merchant=${transactionInput.Merchant}`);
            logger.warn(`Available transactions: ${JSON.stringify(transactions.map((t: Transaction) => ({ Date: t.Date, Amount: t.Amount, Merchant: t.Merchant })), null, 2)}`);
            return {
                success: false,
                message: 'Transaction not found - it may have been modified or deleted'
            };
        }
        
        const transaction = transactions[transactionIdx];
        const previousAccRec = transaction.AccRec || 0;
        
        logger.info(`Found transaction at index ${transactionIdx}: ${JSON.stringify(transaction, null, 2)}`);

        if (Math.abs(accRecAmount) > Math.abs(transaction.Amount)) {
            return {
                success: false,
                message: 'Acc rec amount cannot exceed transaction amount'
            }
        }

        if ((accRecAmount > 0 && transaction.Amount < 0) || (accRecAmount < 0 && transaction.Amount > 0)) {
            return {
                success: false,
                message: 'Acc rec must have the same sign as the transaction (both positive for purchases, both negative for refunds)'
            }
        }
        
        transactions[transactionIdx].AccRec = accRecAmount;
        transactions[transactionIdx].NetSpend = transactions[transactionIdx].Amount - accRecAmount;
        const updatedStatementData = recalculateStatementTotals(statement);

        await pool.query(
            'UPDATE transaction_records SET data = $1 WHERE id = $2 AND user_id = $3',
            [JSON.stringify(updatedStatementData), statementId, session?.user?.email]
        );
        
        const updateDetails = {
            statementId,
            statementFileName: statement.file_name,
            transactionIndex: transactionIdx,
            merchant: transaction.Merchant,
            transactionAmount: transaction.Amount,
            transactionDate: new Date(transaction.Date).toLocaleDateString(),
            previousAccRec,
            newAccRec: accRecAmount,
            accRecChange: accRecAmount - previousAccRec,
            updatedTotals: {
                grossTotal: updatedStatementData.totalSpend,
                netTotal: updatedStatementData.netTotal
            }
        };
        
        logger.info(`Updated: ${updateDetails.merchant} - AccRec: $${previousAccRec} → $${accRecAmount} (${accRecAmount > previousAccRec ? '+' : ''}${updateDetails.accRecChange}) | Net Total: $${updateDetails.updatedTotals.netTotal}`);
        return { 
            success: true, 
            message: 'Transaction updated successfully',
            details: updateDetails,
            updatedStatement: updatedStatementData
        };
    } catch (error) {
        logger.error(`Error updating acc rec for transaction: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
            logger.error(error.stack);
        }
        return { success: false, message: 'Failed to update acc rec for transaction' };
    }
}

function recalculateStatementTotals(statementData: Statement): Statement {
    if (!statementData) {
        logger.error(`Statement data is missing or invalid`);
        throw new Error('Statement data is missing or invalid');
    }
    
    const transactions = statementData.transactions;
    let grossTotal = 0;
    let netTotal = 0;

    if (transactions && Array.isArray(transactions)) {
        transactions.forEach((t: Transaction) => {
            grossTotal += t.Amount;
            netTotal += t.Amount - (t.AccRec || 0);
        });
    }

    const categoriesMap = statementData.categories;
    const updatedSummary = summarizeSpendByCategoryWithNet(transactions, categoriesMap);
    
    // Recalculate insights with updated net totals
    const updatedInsights = getInsights(transactions, updatedSummary);

    return {
        ...statementData,
        totalSpend: grossTotal,
        netTotal: netTotal,
        summary: updatedSummary,
        insights: updatedInsights
    };
}

function summarizeSpendByCategoryWithNet(
    transactions: Transaction[], 
    categoriesMap: Record<string, string>
): any[] {
    const summary: Record<string, any> = {};
    const transactionCounts: Record<string, Record<string, number>> = {};
    
    for (const transaction of transactions) {
        const category = categoriesMap[transaction.Merchant] || 'unknown';
        
        if (!(category in summary)) {
            summary[category] = {
                total: 0,
                netTotal: 0,
                transactions: {},
                biggestTransaction: { merchant: '', amount: 0 },
            };
            transactionCounts[category] = {};
        }
        
        transactionCounts[category][transaction.Merchant] = 
            (transactionCounts[category][transaction.Merchant] || 0) + 1;
        
        const amount = Number(transaction.Amount) || 0;
        summary[category].total += amount;
        
        const netAmount = amount - (transaction.AccRec ?? 0);
        summary[category].netTotal += netAmount;
        
        if (amount > summary[category].biggestTransaction.amount) {
            summary[category].biggestTransaction = { 
                merchant: transaction.Merchant, 
                amount: amount 
            };
        }

        const baseAmount = summary[category].transactions[transaction.Merchant] || 0;
        summary[category].transactions[transaction.Merchant] = baseAmount + amount;
    }

    return Object.entries(summary).map(([category, data]: [string, any]) => {
        const formattedTransactions: Record<string, number> = {};
        
        Object.entries(data.transactions).forEach(([merchant, amount]: [string, any]) => {
            const count = transactionCounts[category][merchant];
            const key = count > 1 ? `${merchant} (${count})` : merchant;
            formattedTransactions[key] = Number(amount.toFixed(2));
        });

        return {
            Category: category,
            Total: Number(data.total.toFixed(2)),
            NetTotal: Number(data.netTotal.toFixed(2)),
            Transactions: formattedTransactions,
            BiggestTransaction: {
                merchant: data.biggestTransaction.merchant,
                amount: Number(data.biggestTransaction.amount.toFixed(2))
            }
        };
    });
}