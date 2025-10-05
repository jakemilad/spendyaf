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
import {tempStatements} from "@/components/temp/temp-data"
import { DEFAULT_CATEGORIES } from "./utils/dicts";
import { assert } from "console";
import { stat } from "fs";

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
    console.log('⏱️  Starting optimized statement processing...');
    
    try {
        const session = await getSession();

        if (!session?.user?.email) {
            throw new Error('Unauthorized access attempt');
        }

        const file = formData.get('file') as File;
        const fileName = formData.get('fileName') as string || file?.name || 'unknown';

        if (!file) {
            throw new Error('No file uploaded');
        }
        if (!file.name.endsWith('.csv')) {
            throw new Error('File must be a CSV');
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const processedTransactions: Transaction[] = await processCSV(buffer);
        const transactions = processedTransactions.filter(t => !t.Merchant.includes("PAYMENT RECEIVED"))
        const uniqueMerchants: string[] = [... new Set(transactions.map(t => t.Merchant))];

        // Get or create user categories with optimized caching
        let userCategories: string[] = await getUserCategories();

        // Check cache for merchant categories first
        const userEmail = session.user?.email!;
        const cachedMerchantCategories = await getCachedMerchantCategories(userEmail, uniqueMerchants);
        const uncachedMerchants = uniqueMerchants.filter(merchant => !cachedMerchantCategories[merchant]);
        
        console.log(`🏪 Merchant Analysis: ${uniqueMerchants.length} total, ${Object.keys(cachedMerchantCategories).length} cached, ${uncachedMerchants.length} need AI processing`);
        console.log(`📈 Cache Hit Rate: ${((Object.keys(cachedMerchantCategories).length / uniqueMerchants.length) * 100).toFixed(1)}%`);
        console.log('🔍 User Categories Available:', userCategories);

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
                        console.warn('AI categorization timeout, using fallback categories');
                        // Fallback: assign default categories or most common ones
                        console.warn('🔄 Using fallback categorization for', uncachedMerchants.length, 'merchants');
                        const fallbackCategories: Record<string, string> = {};
                        uncachedMerchants.forEach((merchant, index) => {
                            // Distribute merchants across available categories instead of all to first category
                            const categoryIndex = index % categories.length;
                            fallbackCategories[merchant] = categories[categoryIndex] || 'Other';
                        });
                        console.log('🏷️  Fallback categories assigned:', fallbackCategories);
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
                        console.warn('AI categorization timeout, using fallback categories:', error.message);
                        // Fallback: assign default categories
                        console.warn('🔄 Using fallback categorization for', uncachedMerchants.length, 'merchants (existing user)');
                        const fallbackCategories: Record<string, string> = {};
                        uncachedMerchants.forEach((merchant, index) => {
                            // Distribute merchants across available categories instead of all to first category
                            const categoryIndex = index % userCategories.length;
                            fallbackCategories[merchant] = userCategories[categoryIndex] || 'Other';
                        });
                        console.log('🏷️  Fallback categories assigned (existing user):', fallbackCategories);
                        console.log('👤 Available user categories:', userCategories);
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

        // Non-blocking database insert (fire and forget for better response time)
        pool.query(
            'INSERT INTO transaction_records (user_id, data, file_name) VALUES ($1, $2, $3)',
            [userEmail, JSON.stringify(response), fileName]
        ).then(() => {
            console.log('inserted into db');
        }).catch(error => {
            console.error('Database insert error:', error);
        });

        const processingTime = Date.now() - startTime;
        console.log(`⚡ Processing completed in ${processingTime}ms`);
        console.log('🎯 Optimizations applied: Parallel AI processing, merchant caching, timeout protection');
        console.log(response)
        return response;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
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
        const categories = await openAICategories(uniqueMerchants as string[], userCategories);
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