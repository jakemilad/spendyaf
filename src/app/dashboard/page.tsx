import { getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/auth.config"
import { DashboardClient } from "@/components/features/dashboard/dashboard-client"
import { DbStatement } from "../types/types"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const statements = (await getUserStatements() || []) as DbStatement[]
  const session = await getServerSession(authOptions)

  return (
    <DashboardClient 
      initialStatements={statements}
      userName={session?.user?.name || ""}
    />
  )
}

