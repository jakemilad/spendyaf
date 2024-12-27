import Link from "next/link";
import { compareStatements } from "../actions";
import { CompareStatements } from "@/components/compare-statements";
import { Button } from "@/components/ui/button";

export default async function ComparePage() {
    const {data, months} = await compareStatements();

    return(
    <div>
        {data.length > 0 ? (<CompareStatements data={data} months={months} />) : (
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