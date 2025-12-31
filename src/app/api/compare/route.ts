import { compareStatementAreaChart } from "@/app/compare/actions";
import { compareStatements } from "@/app/compare/actions";
import { getUserStatements } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const statements = await getUserStatements();
        const areaChartData = await compareStatementAreaChart(statements);
        const {data, months} = await compareStatements(statements);
        return NextResponse.json({ areaChartData, data, months });
    } catch (error) {
        console.error('Error in compare API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}