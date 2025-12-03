import pool from "@/lib/db";
import logger from "@/lib/logger";
import { getSession, getUserStatements, processStatement, reprocessStatement } from "../actions";
import { DbStatement } from "../types/types";

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

export async function reprocessStatementsAfterOverride() {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            const message = 'User is required to reprocess statements after overrides';
            logger.warn(message);
            return { success: false, message };
        }
        const userId = session.user.email;
        const statements = await getUserStatements();
        for (const statement of statements) {
            await updateStatementOverride(userId, statement);
        }
    } catch (error) {
        logger.error(`Error reprocessing statements after overrides: ${JSON.stringify(error, null, 2)}`);
        return { success: false, message: 'Failed to reprocess statements after overrides' };
    }
}

export async function updateStatementOverride(userId: string, statement: DbStatement) {
    try {
        if (!userId || !statement) {
            const message = 'User and statement are required to reprocess a statement after an override';
            logger.warn(message);
            return { success: false, message };
        }
        const transactions = statement?.data.transactions;
        const uniqueMerchants = [... new Set(transactions.map((t: any) => t.Merchant))];

        const response = await processStatement(userId, transactions, uniqueMerchants, statement.data.fileName);
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