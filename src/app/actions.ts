"use server"
import { neon } from "@neondatabase/serverless";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "./api/auth/auth.config";
import { processCSV, summarizeSpendByCategory } from "./utils/dataProcessing";
import { openAICategories } from "./utils/openai_api";
import { Transaction } from "./types/types";
import { UploadResult } from "./types/types";
import { CategorySummary } from "./types/types";
import pool from "@/lib/db";
import { DbStatement } from "./types/types";
import { revalidatePath } from 'next/cache';
const sql = neon(process.env.DATABASE_URL!);

async function getSession(): Promise<Session | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return null;
    return session;
}

export async function getUserStatements(): Promise<DbStatement[] | null> {
    try {
        const session = await getSession();
        if (!session) return null;

        const rawStatements = await sql`
            SELECT id, file_name, data, created_at 
            FROM transaction_records 
            WHERE user_id = ${session?.user?.email}
            ORDER BY created_at DESC
        `;
        console.group(rawStatements);

        const statements: DbStatement[] = rawStatements.map(row => ({
            id: row.id.toString(),
            file_name: row.file_name,
            created_at: row.created_at,
            data: row.data
        }));

        return statements;
    } catch (error) {
        console.error('Error fetching statements:', error);
        return null;
    }
}

export async function uploadAndProcessStatement(formData: FormData): Promise<UploadResult> {
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
        const categories = await openAICategories(uniqueMerchants);
        const summary: CategorySummary[] = summarizeSpendByCategory(transactions, categories);

        const totalSpend = transactions.reduce((sum, transaction) => sum + Math.abs(Number(transaction.Amount)), 0).toFixed(2);

        const response = {
            summary, 
            categories, 
            transactions, 
            fileName,
            totalSpend: Number(totalSpend)
        };

        await pool.query(
            'INSERT INTO transaction_records (user_id, data, file_name) VALUES ($1, $2, $3)', 
            [session?.user?.email, JSON.stringify(response), fileName]);
        console.log('inserted into db');

        return {
            success: true,
            data: response
        };

    } catch (error) {
        console.error('Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
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
            transactions: data.data.transactions
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