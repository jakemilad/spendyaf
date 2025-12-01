import { Test } from "@/app/utils/openai_api";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    try {
        const response = await Test("What is the capital of France?");
        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error in test API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}