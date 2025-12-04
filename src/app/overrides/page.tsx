import { authOptions } from "../api/auth/auth.config"
import { getServerSession } from "next-auth"
import {getAllCachedMerchantCategories} from './actions'


export default async function Overrides() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        return <h1>overrides</h1>
    }
    const userId = session.user.email
    const allMerchants = await getAllCachedMerchantCategories(userId)

    return (
        <h1>{JSON.stringify(allMerchants)}</h1>
    )
}
