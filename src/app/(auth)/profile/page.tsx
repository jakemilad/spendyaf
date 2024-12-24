import { getServerSession } from "next-auth"
import { authOptions } from "../../api/auth/auth.config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUserStatements } from "../../actions"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  const statements = await getUserStatements()

  if (!session?.user) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session.user.image || ''} alt={session.user.name || 'User'} />
            <AvatarFallback>{session.user.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{session.user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Account Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Statements</p>
                  <p className="text-2xl font-bold">{statements?.length || 0}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm">
                    {new Date(statements?.[0]?.created_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
