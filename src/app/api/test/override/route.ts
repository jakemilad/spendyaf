import { NextResponse } from "next/server";
import { applyMerchantOverrides, getStatementById } from "@/app/actions";
import { DbStatement } from "@/app/types/types";


export async function GET(request: Request) {
    try {
        const statement = await getStatementById(54);
        const overrides = {
            'LINKEDINPREA MOUNTAIN VIEW': 'Online Subscriptions',
        }
        const response = await applyMerchantOverrides(statement as DbStatement, overrides);
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in override API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}