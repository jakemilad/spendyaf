import { SummaryTable } from "@/components/summary-table";
import { tempData } from "@/components/temp-data";

export default function TablePage() {
    return (
        <div>
            <SummaryTable statement={{data: tempData}} />
        </div>
    )
}