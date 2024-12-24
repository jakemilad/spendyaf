
import { compareStatements } from "../../actions";

export default async function TestPage(){
    const results = await compareStatements();
    return(
        <div>
            {JSON.stringify(results, null, 2)}
        </div>
    )
}