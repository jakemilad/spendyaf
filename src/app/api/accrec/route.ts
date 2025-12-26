import { NextResponse } from "next/server";
import { updateTransasctionAccRec } from "@/app/overrides/actions";
import { Transaction } from "@/app/types/types";
import logger from "@/lib/logger";

export async function GET(request: Request) {
    const statementId = 63;
    const transactionInput: Transaction = {
        Date: 1762578000000,
        Amount: 824.55,
        Merchant: "LULULEMONCOM"
    }
    const accRecAmount = 124.55;
    try {
        const result = await updateTransasctionAccRec(statementId, transactionInput, accRecAmount);
        if (!result.success) {
            return NextResponse.json({error: result.message}, {status: 400});
        }
        return NextResponse.json(result);
    } catch (error) {
        logger.error(`Error updating transaction acc rec: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}