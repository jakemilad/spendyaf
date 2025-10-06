import { DbStatement } from "@/app/types/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, CreditCard, Calendar, ShoppingBag } from "lucide-react"

export function InsightsComponent({ statement }: { statement: DbStatement }) {
  const insights = statement.data.insights

  return (
    <Card>
    <div className="p-3 sm:p-4">
      <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Monthly Insights</h3>
      <div className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Daily Average
              </CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                ${insights.averageSpend.daily.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-medium">
                Weekly Average
              </CardTitle>
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold">
                ${insights.averageSpend.weekly.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Largest Transaction
            </CardTitle>
            <ArrowUpDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              ${insights.biggestTransaction.amount.toFixed(2)}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {insights.biggestTransaction.merchant}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Most Frequent
            </CardTitle>
            <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              ${insights.mostFrequentTransaction.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.mostFrequentTransaction.merchant} ({insights.mostFrequentTransaction.frequency}x)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Highest Category
            </CardTitle>
            <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">
              ${insights.biggestCategorySpend.total.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {insights.biggestCategorySpend.category}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
    </Card>
  )
}
