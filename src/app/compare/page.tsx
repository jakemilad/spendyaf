import Link from "next/link";
import { compareStatementAreaChart, compareStatements, getUserStatements } from "../actions";
import { CompareClient } from "@/components/features/compare/compare-client";
import { Button } from "@/components/ui/button";

export default async function ComparePage() {
    const statements = await getUserStatements();
    const {data, months} = await compareStatements(statements);
    const areaChartData = await compareStatementAreaChart(statements);
    
    return(
        <div className="min-h-screen bg-background">
            {statements.length > 0 ? (
                <CompareClient data={data} months={months} areaChartData={areaChartData} />
            ) : (
                <AtLeastOneStatement />
            )}
        </div>
    )
}

function AtLeastOneStatement() {
    return (
        <div className="container mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-6 px-6">
            <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <svg 
                        className="w-8 h-8 text-muted-foreground" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                        />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold">No Statements to Compare</h1>
                <p className="text-muted-foreground leading-relaxed">
                    Upload at least two bank statements to start comparing spending patterns and identify trends across different months.
                </p>
            </div>
            <Link href="/upload-statement">
                <Button size="lg" className="mt-4">
                    Upload Statement
                </Button>
            </Link>
        </div>
    )
}