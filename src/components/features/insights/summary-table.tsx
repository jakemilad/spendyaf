import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { CategoryBudgetMap, DbStatement } from "@/app/types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryTableProps {
    statement: DbStatement;
    categoryBudgets?: CategoryBudgetMap;
}

const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

const deriveBadgeTone = (ratio: number) => {
    if (ratio >= 1) return "border-rose-500/40 bg-rose-500/10 text-rose-500"
    if (ratio >= 0.8) return "border-amber-500/40 bg-amber-500/10 text-amber-500"
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-500"
}

export function SummaryTable({ statement, categoryBudgets }: SummaryTableProps) {
    const sortedSummary = [...statement.data.summary].sort((a, b) => b.Total - a.Total)
    const budgets = categoryBudgets ?? {}

    return (
        <div className="h-full w-full">
            <Card className="h-full">
                <CardContent className="h-full p-3 sm:p-6 overflow-x-auto">
                    <Table className="h-full">
                        <TableCaption className="text-left -mt-1 font-bold text-sm sm:text-lg caption-top dark:text-white -mb-2">
                            {statement.data.fileName} Statement Summary
                        </TableCaption>
                        <TableCaption className="text-left font-bold text-xs sm:text-sm mb-4 caption-top text-muted-foreground">
                            Categorized transactions powered by AI
                        </TableCaption>
                        <TableHeader>
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="w-[40%] py-3 sm:py-4 pl-2 text-sm sm:text-lg">Category</TableHead>
                                <TableHead className="w-[30%] text-left pr-2 text-sm sm:text-lg">Largest Transaction</TableHead>
                                <TableHead className="w-[30%] text-right text-sm sm:text-lg">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSummary.map((row) => {
                                const budgetTarget = budgets[row.Category]
                                const ratio = budgetTarget ? row.Total / budgetTarget : 0
                                const badgeTone = deriveBadgeTone(ratio)
                                const progressPercentage = Math.round(ratio * 100)

                                return (
                                    <Dialog key={row.Category}>
                                        <DialogTrigger asChild>
                                            <TableRow className="cursor-pointer hover:bg-accent/50">
                                                <TableCell className="text-left font-medium text-sm sm:text-lg py-3 sm:py-4">{row.Category}</TableCell>
                                                <TableCell className="text-left text-sm sm:text-lg">
                                                    {row.BiggestTransaction.merchant.split(' ').slice(0, 2).join(' ')}
                                                    <span className="text-xs sm:text-sm text-muted-foreground block mt-1">
                                                        {formatCurrency(row.BiggestTransaction.amount)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm sm:text-lg">
                                                    {formatCurrency(row.Total)}
                                                    {budgetTarget && (
                                                        <span
                                                            className={cn(
                                                                "mt-1 inline-flex items-center justify-end rounded-full border px-2 py-0.5 text-xs font-medium",
                                                                badgeTone
                                                            )}
                                                        >
                                                            {progressPercentage}%
                                                            <span className="ml-1 hidden sm:inline">
                                                                of {formatCurrency(budgetTarget)}
                                                            </span>
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle className="text-center font-bold text-xl pb-4">
                                                    {row.Category} Transactions
                                                </DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                {Object.entries(row.Transactions).map(([transaction, count]) => (
                                                    <div key={transaction} className="flex justify-between items-center border-b pb-2">
                                                        <span className="font-medium">{transaction}</span>
                                                        <span className="text-muted-foreground">
                                                            {formatCurrency(count)}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-end">
                                                    <span className="text-muted-foreground">Total:</span>
                                                    <span className="ml-3 font-medium">
                                                        {formatCurrency(Object.values(row.Transactions).reduce((sum, count) => sum + count, 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="text-sm sm:text-lg">Total</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right text-sm sm:text-lg">
                                    {formatCurrency(statement.data.totalSpend ?? 0)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
