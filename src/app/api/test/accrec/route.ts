import { NextResponse } from "next/server";
import { grabAllTransactionsForStatement } from "@/app/overrides/actions";
import logger from "@/lib/logger";

export async function GET(request: Request) {
    try {
        const statementId = 51;
        if (!statementId) {
            return NextResponse.json({ error: 'Statement ID is required' }, { status: 400 });
        }
        const transactions = await grabAllTransactionsForStatement(Number(statementId));
        return NextResponse.json({ transactions });
    } catch (error) {
        logger.error(`Error in grab all transactions for statement API route: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}