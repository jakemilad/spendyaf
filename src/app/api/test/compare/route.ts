import { getUserStatements } from "@/app/actions";
import { compareStatements } from "@/app/compare/actions";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    const statements = await getUserStatements();
    const {data, months} = await compareStatements(statements);
    return NextResponse.json({data, months});
} 