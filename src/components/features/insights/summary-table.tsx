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
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SummaryTableProps {
    statement: DbStatement;
    categoryBudgets?: CategoryBudgetMap;
}

const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`

export function SummaryTable({ statement, categoryBudgets }: SummaryTableProps) {
    const sortedSummary = [...statement.data.summary].sort((a, b) => b.Total - a.Total)
    const budgets = categoryBudgets ?? statement.data.budgets ?? {}

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
                                <TableHead className="w-[25%] text-left text-base">Category</TableHead>
                                <TableHead className="w-[25%] text-left text-base">Largest Transaction</TableHead>
                                <TableHead className="w-[30%] text-left text-base">Budget</TableHead>
                                <TableHead className="w-[20%] text-right text-base">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSummary.map((row) => {
                                const budgetTarget = budgets[row.Category]
                                const ratio = budgetTarget ? row.Total / budgetTarget : 0
                                const progressPercentage = Math.round(ratio * 100)
                                const transactionsArray = Object.entries(row.Transactions)
                                    .map(([transaction, amount]) => ({
                                        name: transaction,
                                        amount: Number(amount)
                                    }))
                                    .sort((a, b) => b.amount - a.amount)
                                const transactionCount = transactionsArray.length
                                const averageSpend = transactionCount > 0 ? row.Total / transactionCount : 0
                                const topTransaction = transactionsArray[0]
                                const totalAmount = transactionsArray.reduce((sum, entry) => sum + entry.amount, 0)

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
                                                <TableCell className="text-left">
                                                    {budgetTarget ? (
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <span className="text-xs font-medium flex items-center gap-1">
                                                                    {ratio >= 1 ? (
                                                                        <AlertCircle className="h-3 w-3 text-rose-500" />
                                                                    ) : ratio >= 0.8 ? (
                                                                        <TrendingUp className="h-3 w-3 text-amber-500" />
                                                                    ) : (
                                                                        <TrendingDown className="h-3 w-3 text-emerald-500" />
                                                                    )}
                                                                    <span className={cn(
                                                                        ratio >= 1 ? "text-rose-500" : 
                                                                        ratio >= 0.8 ? "text-amber-500" : 
                                                                        "text-emerald-500"
                                                                    )}>
                                                                        {progressPercentage}%
                                                                    </span>
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatCurrency(budgetTarget)}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all",
                                                                        ratio >= 1 ? "bg-rose-500" : 
                                                                        ratio >= 0.8 ? "bg-amber-500" : 
                                                                        "bg-emerald-500"
                                                                    )}
                                                                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground"></span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-sm sm:text-lg font-semibold">
                                                    {formatCurrency(row.Total)}
                                                </TableCell>
                                            </TableRow>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
                                            <DialogHeader className="flex-shrink-0">
                                                <DialogTitle className="text-xl font-bold">
                                                    {row.Category} Transactions
                                                </DialogTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {transactionCount} transaction{transactionCount !== 1 ? "s" : ""}
                                                </p>
                                            </DialogHeader>
                                            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Total Spend
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold">
                                                            {formatCurrency(row.Total)}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Transactions
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold">
                                                            {transactionCount}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
                                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                            Avg Spend
                                                        </p>
                                                        <p className="mt-1 text-lg font-semibold">
                                                            {formatCurrency(averageSpend)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {budgetTarget && (
                                                    <div className="rounded-xl border border-border/40 bg-card/40 p-4 shadow-sm">
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                                    Budget Target
                                                                </p>
                                                                <p className="mt-1 text-lg font-semibold">
                                                                    {formatCurrency(budgetTarget)}
                                                                </p>
                                                            </div>
                                                            <div className="w-full sm:w-1/2">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    {progressPercentage}% of target used
                                                                </p>
                                                                <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
                                                                    <div
                                                                        className={cn(
                                                                            "h-full rounded-full transition-all",
                                                                            ratio >= 1 ? "bg-rose-500" :
                                                                            ratio >= 0.8 ? "bg-amber-500" :
                                                                            "bg-emerald-500"
                                                                        )}
                                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {topTransaction && (
                                                    <div className="rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                                Largest Transaction
                                                            </p>
                                                            <p className="mt-1 text-base font-semibold">
                                                                {topTransaction.name}
                                                            </p>
                                                        </div>
                                                        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600">
                                                            {formatCurrency(topTransaction.amount)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                                        All Transactions
                                                    </p>
                                                    <Separator className="mt-2" />
                                                </div>
                                                <div className="space-y-3 py-1">
                                                    {transactionsArray.map((entry, index) => (
                                                        <div
                                                            key={entry.name}
                                                            className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 p-3 transition-colors hover:bg-muted/20"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-semibold text-muted-foreground w-6 flex justify-center">
                                                                    {index + 1}
                                                                </span>
                                                                <p className="text-sm font-medium leading-relaxed">
                                                                    {entry.name}
                                                                </p>
                                                            </div>
                                                            <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                                                                {formatCurrency(entry.amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center pt-2">
                                                    <span className="font-semibold text-base">Total</span>
                                                    <span className="text-lg font-bold tabular-nums">
                                                        {formatCurrency(totalAmount)}
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
                                <TableCell colSpan={3}></TableCell>
                                <TableCell className="text-right text-sm sm:text-lg font-semibold">
                                    Total: {formatCurrency(statement.data.totalSpend ?? 0)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
