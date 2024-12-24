import { compareStatements } from "../../actions";
import { CompareStatements } from "@/components/compare-statements";

export default async function ComparePage() {
    const {data, months} = await compareStatements();

    return(
    <div>
        <CompareStatements data={data} months={months} />
    </div>
    )
}