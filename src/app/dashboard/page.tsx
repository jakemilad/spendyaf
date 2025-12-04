import { getCategoryBudgets, getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/auth.config"
import { DashboardClient } from "@/components/features/dashboard/dashboard-client"
import { DbStatement } from "../types/types"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const statements = (await getUserStatements() || []) as DbStatement[]
  const session = await getServerSession(authOptions)
  const categoryBudgets = await getCategoryBudgets()

  return (
    <DashboardClient 
      initialStatements={statements}
      userName={session?.user?.name || ""}
      initialCategoryBudgets={categoryBudgets}
    />
  )
}
