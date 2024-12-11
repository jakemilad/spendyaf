import { getUserStatements } from "@/app/actions"
import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { DashboardContent } from "@/components/dashboard-content"

export default async function DashboardPage() {
  const statements = await getUserStatements() || []
  const session = await getServerSession(authOptions)

  return (
    <DashboardContent 
      initialStatements={statements}
      userName={session?.user?.name || ""}
    />
  )
}