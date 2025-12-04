import { NextResponse } from "next/server";
import { applyMerchantOverrides, getStatementById } from "@/app/actions";
import { DbStatement } from "@/app/types/types";
import { applyAllOverrides, applyOverride, getAllCachedMerchantCategories, reprocessStatementsAfterOverride } from "@/app/overrides/actions";
import logger from "@/lib/logger";


// export async function GET(request: Request) {
//     try {
//         const statement = await getStatementById(54);
//         const overrides = {
//             'LINKEDINPREA MOUNTAIN VIEW': 'Online Subscriptions',
//         }
//         const response = await applyMerchantOverrides(statement as DbStatement, overrides);
//         return NextResponse.json(response);
//     } catch (error) {
//         console.error('Error in override API route:', error);
//         return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//     }
// }

export async function GET(request: Request) {
    try {
        const overrides: Record<string,string> = {
            // 'LENA MARKET': 'Groceries',
            // 'CHIT CHAT BURGER BAR': 'Restaurants'
        }

        const userId = 'jake.milad@gmail.com';
        const override = await applyAllOverrides(overrides)
        const res = await reprocessStatementsAfterOverride(userId, overrides)
        return NextResponse.json({override, res});
    } catch (error) {
        logger.error(`Error in override API route: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
