import { summarizeSpendByCategory, getInsights} from "@/app/utils/dataProcessing";
import { Transaction, DbStatement} from "@/app/types/types";
import pool from "@/lib/db";
import { getUserStatements } from "@/app/actions";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function GET(request: Request) {
try {
    const statements = await getUserStatements();
    logger.info(`Recalculating total spend for ${statements.length} statements`);
    for (const statement of statements) {
        const result = await recalculateTotals(statement);
        logger.info(`Updated total spend for ${result.fileName} from ${result.originalTotalSpend} to ${result.newTotalSpend}`);
    }

    return NextResponse.json({success: true, message: 'Total spend updated for all statements'});
} catch (error) {
    logger.error(`Error updating total spend for all statements: ${JSON.stringify(error, null, 2)}`);
    return NextResponse.json({success: false, message: 'Error updating total spend for all statements'}, {status: 500});
  }
}

async function recalculateTotals(statementData: DbStatement) {
    const originalTotalSpend = statementData.data.totalSpend;
    logger.info(`Recalculating total spend for ${statementData.data.fileName} from ${originalTotalSpend}`);
    const summary = summarizeSpendByCategory(statementData.data.transactions, statementData.data.categories);
    const totalSpendNumber = statementData.data.transactions.reduce(
            (sum: number, transaction: Transaction) => sum + Number(transaction.Amount),
            0
        );
    const insights = getInsights(statementData.data.transactions, summary);

    const updatedStatementData = {
        ...statementData.data,
        categories: statementData.data.categories,
        summary,
        totalSpend: Number(totalSpendNumber.toFixed(2)),
        insights
    };

    logger.info(`Updating total spend for ${statementData.data.fileName} to ${Number(totalSpendNumber.toFixed(2))}`);
    await pool.query(
        'UPDATE transaction_records SET data = $1 WHERE id = $2',
        [JSON.stringify(updatedStatementData), statementData.id]
    );
    return {success: true, fileName: statementData.data.fileName, originalTotalSpend: originalTotalSpend, newTotalSpend: Number(totalSpendNumber.toFixed(2))};
}
