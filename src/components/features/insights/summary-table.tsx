"use client"

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { CategoryBudgetMap, DbStatement, CategorySummary } from "@/app/types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle, Maximize2, ExternalLink } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    const [isProMode, setIsProMode] = useState(false);
    const sortedSummary = Array.isArray(statement.data?.summary) 
        ? [...statement.data.summary].sort((a, b) => b.Total - a.Total)
        : [];
    const budgets = categoryBudgets ?? statement.data?.budgets ?? {}

    const renderBudgetProgress = (row: CategorySummary, isCompact: boolean = false) => {
        const budgetTarget = budgets[row.Category]
        if (!budgetTarget) return isCompact ? <span className="text-xs text-muted-foreground"></span> : null;

        const ratio = row.Total / budgetTarget
        const progressPercentage = Math.round(ratio * 100)
        
        return (
            <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium flex items-center gap-1">
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
                    <span className="text-sm text-muted-foreground">
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
        )
    }

    const renderDetails = (row: CategorySummary) => {
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
            <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Total Spend
                        </p>
                        <p className="mt-1 text-base font-semibold">
                            {formatCurrency(row.Total)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Transactions
                        </p>
                        <p className="mt-1 text-base font-semibold">
                            {transactionCount}
                        </p>
                    </div>
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Avg Spend
                        </p>
                        <p className="mt-1 text-base font-semibold">
                            {formatCurrency(averageSpend)}
                        </p>
                    </div>
                </div>
                {budgetTarget && (
                    <div className="rounded-lg border border-border/40 bg-card/40 p-3 shadow-sm">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Budget Target
                                </p>
                                <p className="mt-0.5 text-base font-semibold">
                                    {formatCurrency(budgetTarget)}
                                </p>
                            </div>
                            <div className="w-full sm:w-1/2">
                                <p className="text-xs text-muted-foreground mb-1">
                                    {progressPercentage}% of target used
                                </p>
                                <div className="h-1.5 w-full rounded-full bg-secondary/50 overflow-hidden">
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
                    <div className="rounded-lg border border-border/40 bg-card/60 p-3 shadow-sm flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Largest Transaction
                            </p>
                            <p className="mt-0.5 text-sm font-semibold">
                                {topTransaction.name}
                            </p>
                        </div>
                        <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                            {formatCurrency(topTransaction.amount)}
                        </span>
                    </div>
                )}
                <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        All Transactions
                    </p>
                    <Separator className="mt-1.5" />
                </div>
                <div className="space-y-2 py-1 max-h-[300px] overflow-y-auto pr-2">
                    {transactionsArray.map((entry, index) => (
                        <div
                            key={entry.name}
                            className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/10 p-2.5 transition-colors hover:bg-muted/20"
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-xs font-semibold text-muted-foreground w-5 flex justify-center">
                                    {index + 1}
                                </span>
                                <p className="text-xs font-medium leading-relaxed">
                                    {entry.name}
                                </p>
                            </div>
                            <span className="text-xs font-semibold tabular-nums whitespace-nowrap">
                                {formatCurrency(entry.amount)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-1.5">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="text-base font-bold tabular-nums">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-full">
            <Card className="h-full flex flex-col">
                <CardContent className="flex-1 flex flex-col p-3 sm:p-4 overflow-hidden">
                    <div className="flex-shrink-0 mb-4 space-y-1">
                        <div className="flex items-center justify-between gap-3">
                            <h2 className="text-left font-bold text-lg dark:text-white">
                                {statement.data?.fileName || 'Unknown'} Statement Summary
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsProMode(true)}
                                    className="hidden sm:flex items-center gap-1.5 text-xs h-7"
                                >
                                    <Maximize2 className="h-3 w-3" />
                                    Expand
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="h-auto p-0 text-muted-foreground hover:text-foreground hover:bg-transparent"
                                >
                                    <Link href="/overrides" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-normal">
                                        <ExternalLink className="h-3 w-3" />
                                        Make changes
                                    </Link>
                                </Button>
                            </div>
                        </div>
                        <p className="text-left font-bold text-sm text-muted-foreground">
                            Categorized transactions powered by AI
                        </p>
                    </div>
                    <div className="flex-1 overflow-auto min-h-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="w-[25%] text-left text-base">Category</TableHead>
                                <TableHead className="w-[25%] text-left text-base">Largest Transaction</TableHead>
                                <TableHead className="w-[30%] text-left text-base">Budget</TableHead>
                                <TableHead className="w-[20%] text-right text-base">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedSummary.map((row) => (
                                <Dialog key={row.Category}>
                                    <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer hover:bg-accent/50">
                                            <TableCell className="text-left font-medium text-base py-3 sm:py-4">{row.Category}</TableCell>
                                            <TableCell className="text-left text-base py-3 sm:py-4">
                                                {row.BiggestTransaction.merchant.split(' ').slice(0, 2).join(' ')}
                                                <span className="text-sm text-muted-foreground block mt-1">
                                                    {formatCurrency(row.BiggestTransaction.amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-left py-3 sm:py-4">
                                                {renderBudgetProgress(row, true)}
                                            </TableCell>
                                            <TableCell className="text-right text-base font-semibold py-3 sm:py-4">
                                                {formatCurrency(row.Total)}
                                            </TableCell>
                                        </TableRow>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
                                        <DialogHeader className="flex-shrink-0">
                                            <DialogTitle className="text-lg font-bold">
                                                {row.Category} Transactions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="overflow-y-auto flex-1 pr-2">
                                            {renderDetails(row)}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="py-3 sm:py-4"></TableCell>
                                <TableCell className="text-right text-base font-semibold py-3 sm:py-4">
                                    Total: {formatCurrency(statement.data.totalSpend ?? 0)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isProMode} onOpenChange={setIsProMode}>
                <DialogContent className="max-w-[95vw] h-[95vh] flex flex-col p-0 gap-0 sm:rounded-xl">
                    <div className="flex items-center justify-between p-6 pb-4 border-b shrink-0">
                        <div>
                            <DialogTitle className="text-xl font-bold">
                                {statement.data?.fileName || 'Unknown'} - Extended Summary
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Detailed breakdown of spending by category
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex items-center px-6 py-3 border-b bg-muted/30 text-sm font-medium text-muted-foreground shrink-0">
                            <div className="flex-1 grid grid-cols-12 gap-4">
                                <div className="col-span-3">Category</div>
                                <div className="col-span-3">Largest Transaction</div>
                                <div className="col-span-4">Budget</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            <div className="w-4 ml-2" /> 
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 pt-2">
                            <Accordion type="single" collapsible className="w-full space-y-2">
                                {sortedSummary.map((row) => (
                                    <AccordionItem value={row.Category} key={row.Category} className="border rounded-lg px-2 data-[state=open]:bg-muted/10">
                                        <AccordionTrigger className="hover:no-underline py-3 px-2">
                                            <div className="flex-1 grid grid-cols-12 gap-4 text-left items-center">
                                                <div className="col-span-3 font-medium text-base">
                                                    {row.Category}
                                                </div>
                                                <div className="col-span-3 text-sm">
                                                    <div className="font-medium truncate">
                                                        {row.BiggestTransaction.merchant}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        {formatCurrency(row.BiggestTransaction.amount)}
                                                    </div>
                                                </div>
                                                <div className="col-span-4">
                                                    {renderBudgetProgress(row, false)}
                                                </div>
                                                <div className="col-span-2 text-right font-semibold text-base">
                                                    {formatCurrency(row.Total)}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-2 pb-4">
                                            <div className="pt-2 border-t mt-2">
                                                {renderDetails(row)}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                            <div className="flex justify-end mt-6 px-4">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Total Spend</p>
                                    <p className="text-2xl font-bold">{formatCurrency(statement.data.totalSpend ?? 0)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}