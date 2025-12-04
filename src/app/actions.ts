"use server"
import { neon } from "@neondatabase/serverless";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "./api/auth/auth.config";
import { processCSV, summarizeSpendByCategory } from "./utils/dataProcessing";
import { openAICategoriesFromTransactions, openAISummary, getCachedMerchantCategories, cacheMerchantCategories, openAICategoriesWithTimeout, openAICategories } from "./utils/openai_api";
// import { openAICategories as claudeCategories } from "./utils/claude";
import { Transaction } from "./types/types";
import { CategorySummary } from "./types/types";
import pool from "@/lib/db";
import { DbStatement } from "./types/types";
import { revalidatePath } from 'next/cache';
import { getInsights } from "./utils/dataProcessing";
import { Statement } from "./types/types";
import { CategoryBudgetMap } from "./types/types";
import {tempStatements} from "@/components/temp/temp-data"
import { DEFAULT_CATEGORIES } from "./utils/dicts";
import { assert } from "console";
import { stat } from "fs";
import { normalizeCategoryBudgets } from "@/lib/category-budgets";
import logger from "@/lib/logger";

const sql = neon(process.env.DATABASE_URL!);

export async function getSession(): Promise<Session | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return session;
}

export async function getUserStatements(): Promise<DbStatement[]> {
    try {
        const session = await getSession();
        if (!session) return [];
        // const rawStatements: any = tempStatements;

        const rawStatements = await sql`
            SELECT id, file_name, data, created_at 
            FROM transaction_records 
            WHERE user_id = ${session?.user?.email}
            ORDER BY created_at DESC
        `;

        const statements: DbStatement[] = rawStatements.map((row: any) => ({
            id: row.id.toString(),
            file_name: row.file_name,
            created_at: row.created_at,
            data: row.data
        }));

        const sortedStatements = statements.sort((a, b) => b.data.transactions[0].Date - a.data.transactions[0].Date);

        return sortedStatements;
    } catch (error) {
        console.error('Error fetching statements:', error);
        return [];
    }
}

export async function uploadAndProcessStatement(formData: FormData): Promise<Statement> {
    const startTime = Date.now();
    console.log('Starting optimized statement processing');
    
    try {
        const session = await getSession();

        if (!session?.user?.email) {
            throw new Error('Unauthorized access attempt');
        }
        const userEmail = session.user?.email!;
        const file = formData.get('file') as File;
        const fileName = formData.get('fileName') as string || file?.name || 'unknown';

        if (!file) {
            throw new Error('No file uploaded');
        }
        if (!file.name.endsWith('.csv')) {
            throw new Error('File must be a CSV');
        }
        // buffer the file, process transactions by parsing the file, removing payments recieved and grabbing unique merchants
        const buffer = Buffer.from(await file.arrayBuffer());

        // process the transactions
        const processedTransactions: Transaction[] = await processCSV(buffer);
        const transactions = processedTransactions.filter(t => !t.Merchant.includes("PAYMENT RECEIVED"))
        const uniqueMerchants: string[] = [... new Set(transactions.map(t => t.Merchant))];

        
        const response = processStatement(userEmail,transactions, uniqueMerchants,fileName);

        // Non-blocking database insert (fire and forget for better response time)
        pool.query(
            'INSERT INTO transaction_records (user_id, data, file_name) VALUES ($1, $2, $3)',
            [userEmail, JSON.stringify(response), fileName]
        ).then(() => {
            logger.info('inserted into db');
        }).catch(error => {
            logger.error(`Database insert error: ${error}`);
        });

        const processingTime = Date.now() - startTime;
        logger.info(`Processing completed in ${processingTime}ms`);
        logger.info('Optimizations applied: Parallel AI processing, merchant caching, timeout protection');
        logger.info(`Response: ${response}`);
        return response;
    } catch (error) {
        logger.error(`Upload error: ${JSON.stringify(error, null, 2)}`);
        throw error;
    }
}

export async function processStatement(userEmail: string,transactions: Transaction[],uniqueMerchants: string[], fileName: string): Promise<Statement> {
         // Get or create user categories with optimized caching
        let userCategories: string[] = await getUserCategories();

        // Check cache for merchant categories first
        const cachedMerchantCategories = await getCachedMerchantCategories(userEmail, uniqueMerchants);
        logger.info(`Cached Merchant Categories: ${JSON.stringify(cachedMerchantCategories, null, 2)}`);
        const uncachedMerchants = uniqueMerchants.filter(merchant => !cachedMerchantCategories[merchant]);
        logger.info(`Uncached Merchants: ${uncachedMerchants.length == 0 ? 'No uncached merchants' : JSON.stringify(uncachedMerchants, null, 2)}`);


        logger.info(`User Categories: ${JSON.stringify(userCategories, null, 2)}`);
        logger.info('________________________________________________________');
        logger.info(`Merchant Analysis: ${uniqueMerchants.length} total, ${Object.keys(cachedMerchantCategories).length} cached, ${uncachedMerchants.length} need AI processing`);
        logger.info(`Cache Hit Rate: ${((Object.keys(cachedMerchantCategories).length / uniqueMerchants.length) * 100).toFixed(1)}%`);
        logger.info(`User Categories Available: ${JSON.stringify(userCategories, null, 2)}`);

        // Parallel processing: Start both AI operations simultaneously
        let userCategoriesPromise: Promise<string[]> | null = null;
        let merchantCategoriesPromise: Promise<Record<string, string>>;

        if (userCategories.length === 0) {
            // category generation in parallel
            userCategoriesPromise = openAICategoriesFromTransactions(uniqueMerchants)
                .then(async (categories) => {
                    await updateUserCategories(categories);
                    return categories;
                });

            // fallback categories for merchant categorization with timeout
            merchantCategoriesPromise = userCategoriesPromise.then(async (categories) => {
                if (uncachedMerchants.length > 0) {
                    try {
                        const newCategories = await openAICategoriesWithTimeout(uncachedMerchants, categories, 8000);
                        await cacheMerchantCategories(userEmail, newCategories);
                        return { ...cachedMerchantCategories, ...newCategories };
                    } catch (error) {
                        logger.warn('AI categorization timeout, using fallback categories');
                        // Fallback: assign default categories or most common ones
                        logger.warn(`Using fallback categorization for ${uncachedMerchants.length} merchants`);
                        const fallbackCategories: Record<string, string> = {};
                        uncachedMerchants.forEach((merchant, index) => {
                            // Distribute merchants across available categories instead of all to first category
                            const categoryIndex = index % categories.length;
                            fallbackCategories[merchant] = categories[categoryIndex] || 'Other';
                        });
                        logger.info(`Fallback categories assigned: ${fallbackCategories}`);
                        await cacheMerchantCategories(userEmail, fallbackCategories);
                        return { ...cachedMerchantCategories, ...fallbackCategories };
                    }
                }
                return cachedMerchantCategories;
            });
        } else {
            // Use existing categories - only categorize uncached merchants with timeout
            if (uncachedMerchants.length > 0) {
                merchantCategoriesPromise = openAICategoriesWithTimeout(uncachedMerchants, userCategories, 8000)
                    .then(async (newCategories) => {
                        await cacheMerchantCategories(userEmail, newCategories);
                        return { ...cachedMerchantCategories, ...newCategories };
                    })
                    .catch(async (error) => {
                        logger.warn(`AI categorization timeout, using fallback categories: ${error.message}`);
                        // Fallback: assign default categories
                        logger.warn(`Using fallback categorization for ${uncachedMerchants.length} merchants (existing user): ${JSON.stringify(uncachedMerchants, null, 2)}`);
                        const fallbackCategories: Record<string, string> = {};
                        uncachedMerchants.forEach((merchant, index) => {
                            // Distribute merchants across available categories instead of all to first category
                            const categoryIndex = index % userCategories.length;
                            fallbackCategories[merchant] = userCategories[categoryIndex] || 'Other';
                        });
                        logger.info(`Fallback categories assigned (existing user): ${JSON.stringify(fallbackCategories, null, 2)}`);
                        logger.info(`Available user categories: ${JSON.stringify(userCategories, null, 2)}`);
                        await cacheMerchantCategories(userEmail, fallbackCategories);
                        return { ...cachedMerchantCategories, ...fallbackCategories };
                    });
            } else {
                merchantCategoriesPromise = Promise.resolve(cachedMerchantCategories);
            }
        }

        // Await both operations (they run in parallel when possible)
        const [finalUserCategories, categories] = await Promise.all([
            userCategoriesPromise || Promise.resolve(userCategories),
            merchantCategoriesPromise
        ]);

        assert(finalUserCategories.length > 0, 'No user categories found');

        const summary: CategorySummary[] = summarizeSpendByCategory(transactions, categories);
        const totalSpend = transactions.reduce((sum, transaction) => sum + Math.abs(Number(transaction.Amount)), 0).toFixed(2);
        const insights = getInsights(transactions, summary);

        const response = {
            summary,
            categories,
            transactions,
            fileName,
            totalSpend: Number(totalSpend),
            insights
        };

        return response;
}


export async function reprocessStatement(statementId: string): Promise<boolean> {
    try {
        const session = await getSession();
        if (!session) return false;

        const statement = await sql`
            SELECT data, file_name
            FROM transaction_records
            WHERE id = ${statementId} AND user_id = ${session?.user?.email}
        `;

        if(!statement) return false;

        const transactions = statement[0].data.transactions;

        let userCategories: string[] = await getUserCategories();

        const uniqueMerchants = [... new Set(transactions.map((t: any) => t.Merchant))];
        const categories = await openAICategoriesWithTimeout(uniqueMerchants as string[], userCategories);
        // const categories = await claudeCategories(uniqueMerchants as string[], userCategories);
        const summary = summarizeSpendByCategory(transactions, categories as Record<string, string>);
        const totalSpend = transactions.reduce((sum: number, transaction: Transaction) => sum + Math.abs(Number(transaction.Amount)), 0).toFixed(2);
        const insights = getInsights(transactions, summary);

        const updatedData = {
            summary, 
            categories, 
            transactions, 
            fileName: statement[0].file_name,
            totalSpend: Number(totalSpend),
            insights
        };

        await pool.query(
            'UPDATE transaction_records SET data = $1 WHERE id = $2',
            [JSON.stringify(updatedData), statementId]
        );
        revalidatePath('/dashboard');
        return true; 
    } catch (error) {
        console.error('Error reprocessing statement:', error);
        return false;
    }
}

export async function getStatementById(statementId: number) {
    try {
        const session = await getSession();
        if (!session) return null;
        const statement = await sql`
            SELECT id, file_name, data, created_at
            FROM transaction_records
            WHERE id = ${statementId} AND user_id = ${session?.user?.email}
        `;
        return statement[0] || null;
    } catch (error) {
        console.error('Error fetching statement:', error);
        return null;
    }
}

export async function deleteStatement(id: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        await pool.query('DELETE FROM transaction_records WHERE id = $1', [id]);
        revalidatePath('/dashboard');
        return true;
    } catch (error) {
        console.error('Error deleting statement:', error);
        return false;
    }
}

export async function updateStatement(id: string, data: any) {
    try {
        const session = await getSession();
        if (!session) return null;

        const transformedData = {
            summary: data.data.summary,
            fileName: data.data.fileName,
            categories: data.data.categories,
            totalSpend: data.data.totalSpend,
            transactions: data.data.transactions,
            insights: data.data.insights
        };
        
        await pool.query(
            'UPDATE transaction_records SET data = $1, file_name = $2 WHERE id = $3',
            [JSON.stringify(transformedData), data.file_name, id]
        );
        revalidatePath('/dashboard');
        return true;
    } catch (error) {
        console.error('Error updating statement:', error);
        return false;
    }
}

export async function getAISummary(statement: DbStatement, message: boolean): Promise<string> {
    try {
        const aiSummary = openAISummary(statement, message);
        console.log(aiSummary);
        return aiSummary;
    } catch (error) {
        console.error('Error getting summary', error);
        return "error getting content";
    }
}

// export async function getUserCategories(): Promise<string[]> {
//     try {
//         const session = await getSession();
//         if (!session?.user?.email) return DEFAULT_CATEGORIES;
//         const result = await sql`
//             SELECT categories
//             FROM user_categories
//             WHERE user_id = ${session?.user?.email}
//         `
//         if(result.length === 0) return DEFAULT_CATEGORIES;
//         return [...new Set(result[0].categories as string[])];
//     } catch (error) {
//         console.error('Error fetching user categories:', error);
//         return DEFAULT_CATEGORIES;
//     }
// }
export async function getUserCategories(): Promise<string[]> {
    try {
        const session = await getSession();
        if (!session?.user?.email) return [];
        const result = await sql`
            SELECT categories
            FROM user_categories
            WHERE user_id = ${session?.user?.email}
        `
        if(result.length === 0) return [];
        return [...new Set(result[0].categories as string[])];
    } catch (error) {
        console.error('Error fetching user categories:', error);
        return [];
    }
}

export async function updateUserCategories(categories: string[]) {
    try {
        const session = await getSession();
        if (!session?.user?.email) return;

        await sql`
            INSERT INTO user_categories (user_id, categories)
            VALUES (${session?.user?.email}, ${categories})
            ON CONFLICT (user_id) DO UPDATE SET
                categories = ${categories},
                updated_at = CURRENT_TIMESTAMP
        `;
        revalidatePath('/dashboard');
        return true;
    } catch (error) {
        console.error('Error updating user categories:', error);
        return false;
    }
}

export async function getCategoryBudgets(): Promise<CategoryBudgetMap> {
    try {
        const session = await getSession();
        if (!session?.user?.email) return {};

        const result = await sql`
            SELECT budgets
            FROM category_budgets
            WHERE user_id = ${session?.user?.email}
            LIMIT 1
        `;

        if (result.length === 0) return {};

        return normalizeCategoryBudgets(result[0].budgets as Record<string, unknown>);
    } catch (error) {
        console.error('Error fetching category budgets:', error);
        return {};
    }
}

export async function saveCategoryBudgets(budgets: CategoryBudgetMap): Promise<CategoryBudgetMap | null> {
    try {
        const session = await getSession();
        if (!session?.user?.email) return null;

        const normalized = normalizeCategoryBudgets(budgets as Record<string, unknown>);

        const result = await sql`
            INSERT INTO category_budgets (user_id, budgets)
            VALUES (${session?.user?.email}, ${normalized})
            ON CONFLICT (user_id) DO UPDATE SET
                budgets = ${normalized},
                updated_at = CURRENT_TIMESTAMP
            RETURNING budgets
        `;

        const persisted = result[0]?.budgets ?? normalized;
        const sanitized = normalizeCategoryBudgets(persisted as Record<string, unknown>);

        revalidatePath('/dashboard');
        revalidatePath('/categories');
        return sanitized;
    } catch (error) {
        console.error('Error saving category budgets:', error);
        return null;
    }
}

export async function compareStatements(statements: DbStatement[]): Promise<{ data: any[], months: string[] }> {
    try {
        const session = await getSession();
        if(!session?.user?.email) return { data: [], months: [] };

        const allCategories = await getUserCategories();

        const months = statements?.map(s => s.file_name.split('.')[0]) || [];
        
        return {
            data: Array.from(allCategories).map(category => {
                const dataPoint: { category: string; [key: string]: number | string } = { 
                    category 
                };
                
                statements?.forEach(statement => {
                    const monthName = statement.file_name.split('.')[0];
                    const categoryData = statement.data.summary.find(
                        (item: CategorySummary) => item.Category === category
                    );
                    dataPoint[monthName] = categoryData ? categoryData.Total : 0;
                });

                return dataPoint;
            }),
            months
        };
    } catch (error) {
        console.error('Error comparing statements:', error);
        return { data: [], months: [] };
    }
}

export async function compareStatementAreaChart(statements: DbStatement[]) {
    const sortedStatements = statements.sort((a, b) => a.data.transactions[0].Date - b.data.transactions[0].Date);

    // chart data of average spend for each statement
    const averageSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            weeklyAverage: statement.data.insights.averageSpend.weekly,
        }
    });

    const totalSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            totalSpend: statement.data.totalSpend,
        }
    });

    const spendingVolatilityChartData = sortedStatements.map(s => {
        const amount = s.data.transactions.map(t => t.Amount);
        const mean = amount.reduce((a,b) => a+b, 0) / amount.length;
        const variance = amount.reduce((sum, amount)=> sum + Math.pow(amount - mean, 2))
        const stdDev = Math.sqrt(variance)

        return {
            date: s.file_name,
            spendVol: Number(stdDev.toFixed(2))
        }
    })
    
    return {
        weeklyAverage: averageSpendChartData,
        totalSpend: totalSpendChartData,
        spendVol: spendingVolatilityChartData
    } 
}

export async function getAICategories(transactions: Transaction[]) {
    const uniqueMerchants = [... new Set(transactions.map(t => t.Merchant))] as string[];
    const categories = await openAICategoriesFromTransactions(uniqueMerchants);
    return categories;
}

// What i want this to do:
// merge overrides into the merchant map
// re run the same logic as upload and process statement uses (summary, totals, insights)
// persist the rebuilt JSON back to transaction_records.
export async function applyMerchantOverrides(statement: DbStatement, overrides: Record<string, string>) {
    try {
        const session = await getSession();
        if (!session?.user?.email) return null;

        const statementData = await getStatementById(Number(statement.id));
        if (!statementData?.data?.categories || !statementData?.data?.transactions) {
            return null;
        }

        const updatedCategories = { ...statementData.data.categories };
        for (const [merchant, category] of Object.entries(overrides)) {
            if (category) {
                updatedCategories[merchant] = category;
            }
        }

        const summary = summarizeSpendByCategory(statementData.data.transactions, updatedCategories);
        const totalSpendNumber = statementData.data.transactions.reduce(
            (sum: number, transaction: Transaction) => sum + Math.abs(Number(transaction.Amount)),
            0
        );
        const insights = getInsights(statementData.data.transactions, summary);

        const updatedStatementData = {
            ...statementData.data,
            categories: updatedCategories,
            summary,
            totalSpend: Number(totalSpendNumber.toFixed(2)),
            insights
        };

        await pool.query(
            'UPDATE transaction_records SET data = $1 WHERE id = $2',
            [JSON.stringify(updatedStatementData), statementData.id]
        );
        revalidatePath('/dashboard');
        return updatedStatementData;
    } catch (error) {
        console.error('Error applying merchant overrides:', error);
        return null;
    }
}


interface MerchantCategoryRow {
    merchant: string;
    category: string;
    totalSpend: number;
    transactionCount: number;
    hasOverride: boolean;
    overrideUpdatedAt: string | null;
}

export async function getAllMerchantCategories(options?: {
    searchTerm?: string | null;
    limit?: number;
    offset?: number;
}): Promise<MerchantCategoryRow[]> {
    try {
        const session = await getSession();
        if (!session?.user?.email) return [];

        const searchTerm = options?.searchTerm ?? null;
        const limit = options?.limit ?? 200000;
        const offset = options?.offset ?? 0;

        const result = await sql`
            WITH flattened AS (
                SELECT
                    tr.user_id,
                    txn ->> 'Merchant' AS merchant,
                    (txn ->> 'Amount')::numeric AS amount,
                    tr.data->'categories'->>(txn ->> 'Merchant') AS ai_category
                FROM transaction_records tr
                CROSS JOIN LATERAL jsonb_array_elements(tr.data->'transactions') AS txn
                WHERE tr.user_id = ${session.user.email}
            )
            SELECT
                f.merchant,
                COALESCE(mc.category, MAX(f.ai_category)) AS current_category,
                SUM(f.amount) AS total_spend,
                COUNT(*) AS transaction_count,
                CASE WHEN mc.category IS NOT NULL THEN TRUE ELSE FALSE END AS has_override,
                MAX(mc.updated_at) AS override_updated_at
            FROM flattened f
            LEFT JOIN merchant_categories mc
                ON mc.user_id = f.user_id
               AND mc.merchant = f.merchant
            WHERE ${searchTerm}::text IS NULL OR f.merchant ILIKE '%' || ${searchTerm} || '%'
            GROUP BY f.merchant, mc.category, mc.updated_at
            ORDER BY total_spend DESC
            LIMIT ${limit} OFFSET ${offset};
        `;

        return result.map(row => ({
            merchant: row.merchant as string,
            category: row.current_category as string,
            totalSpend: Number(row.total_spend),
            transactionCount: Number(row.transaction_count),
            hasOverride: row.has_override as boolean,
            overrideUpdatedAt: row.override_updated_at as string | null,
        }));
    } catch (error) {
        console.error('Error fetching all merchant categories:', error);
        return [];
    }   
}

export async function updateMerchantCategory(merchant: string, category: string) {
    try {
        const session = await getSession();
        if (!session?.user?.email) {
            throw new Error('Unauthorized');
        }

        const normalizedMerchant = merchant?.trim();
        const normalizedCategory = category?.trim();

        if (!normalizedMerchant || !normalizedCategory) {
            throw new Error('Merchant and category are required');
        }

        await pool.query(
            `INSERT INTO merchant_categories (user_id, merchant, category)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, merchant) DO UPDATE SET
                category = EXCLUDED.category,
                updated_at = CURRENT_TIMESTAMP`,
            [session.user.email, normalizedMerchant, normalizedCategory]
        );

        const statements = await sql`
            SELECT id, file_name, data, created_at
            FROM transaction_records
            WHERE user_id = ${session.user.email}
              AND (data->'categories') ? ${normalizedMerchant}
        `;

        let updatedStatements = 0;
        for (const row of statements) {
            const statement: DbStatement = {
                id: row.id.toString(),
                file_name: row.file_name,
                created_at: row.created_at,
                data: row.data
            };

            const updated = await applyMerchantOverrides(statement, { [normalizedMerchant]: normalizedCategory });
            if (updated) {
                updatedStatements += 1;
            }
        }

        return { success: true, 'Updated Statements': updatedStatements };
    } catch (error) {
        console.error('Error updating merchant category:', error);
        return { success: false, error: 'Failed to update merchant category' };
    }
}
