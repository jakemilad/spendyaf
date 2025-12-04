import { NextResponse } from "next/server";
import { backfillStatementMerchantMap } from "@/app/utils/override";
import logger from "@/lib/logger";

export async function GET() {
    try {
        const result = await backfillStatementMerchantMap();
        return NextResponse.json(result);
    } catch (error) {
        logger.error(`Error in backfill API route: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
