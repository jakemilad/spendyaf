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
import { ScrollArea } from "@/components/ui/scroll-area";
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
                                <TableHead className="w-[25%] py-3 sm:py-4 pl-2 text-sm sm:text-lg">Category</TableHead>
                                <TableHead className="w-[20%] text-left pr-2 text-sm sm:text-lg">Largest Transaction</TableHead>
                                <TableHead className="w-[35%] text-left text-sm sm:text-lg">Budget</TableHead>
                                <TableHead className="w-[20%] text-right text-sm sm:text-lg">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSummary.map((row) => {
                                const budgetTarget = budgets[row.Category]
                                const ratio = budgetTarget ? row.Total / budgetTarget : 0
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
                                        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl font-bold">
                                                    {row.Category} Transactions
                                                </DialogTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {Object.entries(row.Transactions).length} transaction{Object.entries(row.Transactions).length !== 1 ? 's' : ''}
                                                </p>
                                            </DialogHeader>
                                            <Separator className="my-4" />
                                            <ScrollArea className="flex-1 pr-4 -mr-4">
                                                <div className="space-y-0">
                                                    {Object.entries(row.Transactions)
                                                        .sort(([, a], [, b]) => b - a)
                                                        .map(([transaction, amount]) => (
                                                            <div 
                                                                key={transaction} 
                                                                className="flex justify-between items-start gap-4 py-2 hover:bg-accent/50 rounded-lg px-3 -mx-3 transition-colors"
                                                            >
                                                                <span className="font-medium text-sm flex-1 leading-relaxed">
                                                                    {transaction}
                                                                </span>
                                                                <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                                                                    {formatCurrency(amount)}
                                                                </span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </ScrollArea>
                                            <Separator className="my-4" />
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="font-semibold text-base">Total</span>
                                                <span className="text-lg font-bold tabular-nums">
                                                    {formatCurrency(Object.values(row.Transactions).reduce((sum, count) => sum + count, 0))}
                                                </span>
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
                                <TableCell></TableCell>
                                <TableCell className="text-right text-sm sm:text-lg font-semibold">
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
