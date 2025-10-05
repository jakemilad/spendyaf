import { NextRequest, NextResponse } from "next/server";
import { TestClaude } from "@/app/utils/claude";

export async function GET() {
    const response = await TestClaude();
    return NextResponse.json({response});
}