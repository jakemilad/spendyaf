import { Test } from "@/app/utils/openai_api";
import { NextResponse } from "next/server";
import { getMerchantsForDataTable } from "@/app/utils/override";


export async function GET(request: Request) {
    try {
        const response = await getMerchantsForDataTable('jake.milad@gmail.com');
        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error in test API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}