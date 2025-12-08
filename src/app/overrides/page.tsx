import { authOptions } from "../api/auth/auth.config"
import { getServerSession } from "next-auth"
import { getMerchantsForDataTable } from './actions'
import { OverrideClient } from "@/components/override/override-client"
import { redirect } from "next/navigation"
import { getUserCategories } from "../actions"

export const metadata = {
  title: "Overrides | Spendy.af",
  description: "Manage merchant category overrides",
}

export default async function Overrides() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
        redirect("/auth/signin")
    }
    const userId = session.user.email
    const allMerchants = await getMerchantsForDataTable(userId)
    const userCategories = await getUserCategories()

    return (
        <div className="container mx-auto py-10 px-4 md:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Merchant Overrides</h1>
                    <p className="text-muted-foreground mt-1">
                        Manually override categories for specific merchants. 
                        These rules apply to all past and future transactions.
                    </p>
                </div>
            </div>
            
            <OverrideClient merchantData={allMerchants} userCategories={userCategories} />
        </div>
    )
}