import { authOptions } from "../api/auth/auth.config"
import { getServerSession } from "next-auth"
import {getMerchantsForDataTable} from './actions'
import { OverrideClient } from "@/components/override/override-client"



export default async function Overrides() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return <h1>overrides</h1>
    }
    const userId = session.user.email
    const allMerchants = await getMerchantsForDataTable(userId)

    return (
        <div>
            <OverrideClient merchantData={allMerchants} />
        </div>
    )
}
