import { DbStatement } from "@/app/types/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpDown, CreditCard, Calendar, ShoppingBag } from "lucide-react"

export function InsightsComponent({ statement }: { statement: DbStatement }) {
  const insights = statement.data.insights

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div>
          <CardTitle className="text-md">Monthly Insights</CardTitle>
          <CardDescription className="mt-2 text-sm">{statement.data.fileName}</CardDescription>
        </div>
      </CardHeader>
      <div className="p-1 sm:p-3 flex-1">
      <div className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">Daily Average</p>
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                ${insights.averageSpend.daily.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium">Weekly Average</p>
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div className="text-xl sm:text-2xl font-bold">
                ${insights.averageSpend.weekly.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Largest Transaction</p>
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              ${insights.biggestTransaction.amount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {insights.biggestTransaction.merchant}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Most Frequent</p>
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              ${insights.mostFrequentTransaction.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {insights.mostFrequentTransaction.merchant} ({insights.mostFrequentTransaction.frequency}x)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">Highest Category</p>
              <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              ${insights.biggestCategorySpend.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {insights.biggestCategorySpend.category}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </Card>
  )
}
