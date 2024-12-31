import Link from "next/link";
import { compareStatementAreaChart, compareStatements, getUserStatements } from "../actions";
import { CompareClient } from "@/components/compare-client";
import { Button } from "@/components/ui/button";

export default async function ComparePage() {
    const statements = await getUserStatements();
    const {data, months} = await compareStatements(statements);
    const areaChartData = await compareStatementAreaChart(statements);
    
    return(
    <div>
        {statements.length > 0 ? (<CompareClient data={data} months={months} areaChartData={areaChartData} />) : (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold">No Statements to Compare</h1>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                    Upload your bank statements to start comparing spending patterns across different months.
                </p>
                <Link href="/upload">
                    <Button size="lg" className="mt-2">
                        Upload Statement
                    </Button>
                </Link>
            </div>
        )}
    </div>
    )
}