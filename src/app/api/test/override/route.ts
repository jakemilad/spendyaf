import { NextResponse } from "next/server";
import { applyMerchantOverrides, getStatementById } from "@/app/actions";
import { DbStatement } from "@/app/types/types";
import { applyAllOverrides, applyOverride, getAllCachedMerchantCategories, reprocessStatementsAfterOverride } from "@/app/utils/override";
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
            'GRANDVIEW LANES': 'Personal',
            'SALOMON NORTH': 'Shopping',
        }

        const override = await applyAllOverrides('jake.milad@gmail.com', overrides)
        const res = await reprocessStatementsAfterOverride('jake.milad@gmail.com')
        return NextResponse.json({override, res});
    } catch (error) {
        logger.error(`Error in override API route: ${JSON.stringify(error, null, 2)}`);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}