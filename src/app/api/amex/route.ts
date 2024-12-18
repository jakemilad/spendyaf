
import { NextResponse } from "next/server";
import { uploadAndProcessStatement } from "@/app/actions";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const result = await uploadAndProcessStatement(formData);
        
        if (!result) {
            return NextResponse.json(
                { message: result },
                { status: 400 }
            );
        }

        return NextResponse.json(
            result,
            { status: 200 }
        );
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}