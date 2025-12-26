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
import { CategoryBudgetMap, DbStatement, CategorySummary, Transaction } from "@/app/types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, AlertCircle, Maximize2, ExternalLink, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { updateTransasctionAccRec } from "@/app/overrides/actions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";  

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
    const [updatingMerchant, setUpdatingMerchant] = useState<string | null>(null);
    const [accRecInputs, setAccRecInputs] = useState<Record<string, string>>({});
    const [showAccRecInputs, setShowAccRecInputs] = useState(false);
    
    const sortedSummary = Array.isArray(statement.data?.summary) 
        ? [...statement.data.summary].sort((a, b) => {
            const aTotal = a.NetTotal ?? a.Total;
            const bTotal = b.NetTotal ?? b.Total;
            return bTotal - aTotal;
        })
        : [];
    const budgets = categoryBudgets ?? statement.data?.budgets ?? {}

    const netTotalSpend = statement.data?.netTotal ?? statement.data.totalSpend ?? 0;
    const hasAccRecTransactions = statement.data?.transactions?.some(t => (t.AccRec ?? 0) > 0) ?? false;

    const renderBudgetProgress = (row: CategorySummary, isCompact: boolean = false) => {
        const budgetTarget = budgets[row.Category]
        if (!budgetTarget) return isCompact ? <span className="text-xs text-muted-foreground"></span> : null;
        
        const effectiveTotal = row.NetTotal ?? row.Total;
        const ratio = effectiveTotal / budgetTarget
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
        const effectiveTotal = row.NetTotal ?? row.Total;
        const ratio = budgetTarget ? effectiveTotal / budgetTarget : 0
        const progressPercentage = Math.round(ratio * 100)
        
        const transactionsArray = Object.entries(row.Transactions)
            .map(([transaction, amount]) => {
                const fullTransaction = statement.data.transactions.find(
                    t => t.Merchant === transaction && Math.abs(t.Amount - Number(amount)) < 0.01
                );
                
                return {
                    name: transaction,
                    amount: Number(amount),
                    fullTransaction
                };
            })
            .sort((a, b) => {
                const aNet = a.fullTransaction?.NetSpend ?? a.amount;
                const bNet = b.fullTransaction?.NetSpend ?? b.amount;
                return bNet - aNet;
            });
            
        const transactionCount = transactionsArray.length
        const averageSpend = transactionCount > 0 ? effectiveTotal / transactionCount : 0
        const topTransaction = transactionsArray[0]
        
        const totalAmount = transactionsArray.reduce((sum, entry) => {
            const netSpend = entry.fullTransaction?.NetSpend ?? entry.amount;
            return sum + netSpend;
        }, 0);

        return (
            <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {effectiveTotal !== row.Total ? 'Net Spend' : 'Total Spend'}
                        </p>
                        <p className="mt-1 text-base font-semibold">
                            {formatCurrency(effectiveTotal)}
                        </p>
                        {effectiveTotal !== row.Total && (
                            <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(row.Total)}
                            </p>
                        )}
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
                            {formatCurrency(topTransaction.fullTransaction?.NetSpend ?? topTransaction.amount)}
                        </span>
                    </div>
                )}
                <div>
                    <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            All Transactions
                        </p>
                        <div className="flex items-center gap-2">
                            <Checkbox 
                                id="show-accrec" 
                                checked={showAccRecInputs}
                                onCheckedChange={(checked) => setShowAccRecInputs(checked === true)}
                            />
                            <Label 
                                htmlFor="show-accrec" 
                                className="text-xs text-muted-foreground cursor-pointer"
                            >
                                Edit amounts
                            </Label>
                        </div>
                    </div>
                    <Separator className="mt-1.5" />
                </div>
                <div className="space-y-2 py-1 max-h-[300px] overflow-y-auto pr-2">
                    {transactionsArray.map((entry, index) => {
                        const tx = entry.fullTransaction;
                        const inputKey = `${entry.name}-${tx?.Date}`;
                        const currentAccRec = tx?.AccRec ?? 0;
                        const netSpend = tx?.NetSpend ?? entry.amount;
                        
                        return (
                            <div
                                key={inputKey}
                                className="rounded-lg border border-border/40 bg-muted/10 p-3 transition-colors hover:bg-muted/20"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                        <span className="text-xs font-semibold text-muted-foreground w-5 flex-shrink-0 flex justify-center mt-0.5">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium leading-relaxed truncate">
                                                {entry.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Amount: {formatCurrency(entry.amount)}
                                            </p>
                                            {tx?.Date && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    {new Date(tx.Date).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {showAccRecInputs ? (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="flex flex-col items-end gap-1">
                                                <label htmlFor={inputKey} className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                                    Acc Rec
                                                </label>
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                                                    <Input
                                                        id={inputKey}
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max={entry.amount}
                                                        placeholder="0.00"
                                                        value={accRecInputs[inputKey] ?? currentAccRec}
                                                        onChange={(e) => {
                                                            setAccRecInputs(prev => ({
                                                                ...prev,
                                                                [inputKey]: e.target.value
                                                            }));
                                                        }}
                                                        onBlur={(e) => {
                                                            const value = parseFloat(e.target.value) || 0;
                                                            if (value !== currentAccRec && tx) {
                                                                handleAccRecUpdate(
                                                                    entry.name,
                                                                    entry.amount,
                                                                    tx.Date,
                                                                    value
                                                                );
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.currentTarget.blur();
                                                            }
                                                        }}
                                                        disabled={updatingMerchant === entry.name || !tx}
                                                        className="w-20 h-7 text-xs"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col items-end gap-1 min-w-[80px]">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                                                    Net Spend
                                                </span>
                                                <span className={cn(
                                                    "text-xs font-semibold tabular-nums",
                                                    netSpend !== entry.amount ? "text-emerald-600" : ""
                                                )}>
                                                    {formatCurrency(netSpend)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-semibold tabular-nums">
                                                {formatCurrency(netSpend)}
                                            </span>
                                            {currentAccRec > 0 && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    Money In: {formatCurrency(currentAccRec)}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="text-base font-bold tabular-nums">
                        {formatCurrency(totalAmount)}
                    </span>
                </div>
            </div>
        )
    }

    const handleAccRecUpdate = async (
        merchant: string,
        amount: number,
        date: number,
        accRecAmount: number
    ) => {
        setUpdatingMerchant(merchant);
        try {
            const transaction: Transaction = {
                Date: date,
                Amount: amount,
                Merchant: merchant
            }
            const result = await updateTransasctionAccRec(Number(statement.id), transaction, accRecAmount);
            if (result.success) {
                toast.success(`Updated ${merchant}`, {
                    description: `Money in: ${formatCurrency(accRecAmount)}, Net: ${formatCurrency(amount - accRecAmount)}`
                });
                // Reload to show updated totals
                setTimeout(() => window.location.reload(), 1000);
            } else {
                toast.error(`Failed to update ${merchant}`, {
                    description: result.message
                });
            }
        } catch (error) {
            toast.error(`Error updating ${merchant}`, {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setUpdatingMerchant(null);
        }
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
                            {sortedSummary.map((row) => {
                                const displayTotal = row.NetTotal ?? row.Total;
                                const hasNetTotal = row.NetTotal !== undefined && row.NetTotal !== row.Total;
                                
                                return (
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
                                                <TableCell className="text-right py-3 sm:py-4">
                                                    <div className="flex flex-col items-end gap-0.5">
                                                        <span className="text-base font-semibold">
                                                            {formatCurrency(displayTotal)}
                                                        </span>
                                                        {hasNetTotal && (
                                                            <span className="text-xs text-muted-foreground line-through">
                                                                {formatCurrency(row.Total)}
                                                            </span>
                                                        )}
                                                    </div>
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
                                );
                            })}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell colSpan={3} className="py-3 sm:py-4">
                                    {hasAccRecTransactions && (
                                        <span className="text-xs text-muted-foreground italic">
                                            * Net spend reflects accountable receivables
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right py-3 sm:py-4">
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-base font-semibold">
                                            Total: {formatCurrency(netTotalSpend)}
                                        </span>
                                        {hasAccRecTransactions && netTotalSpend !== (statement.data.totalSpend ?? 0) && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatCurrency(statement.data.totalSpend ?? 0)}
                                            </span>
                                        )}
                                    </div>
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
                                {sortedSummary.map((row) => {
                                    const displayTotal = row.NetTotal ?? row.Total;
                                    const hasNetTotal = row.NetTotal !== undefined && row.NetTotal !== row.Total;
                                    
                                    return (
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
                                                    <div className="col-span-2 text-right">
                                                        <div className="font-semibold text-base">
                                                            {formatCurrency(displayTotal)}
                                                        </div>
                                                        {hasNetTotal && (
                                                            <div className="text-xs text-muted-foreground line-through">
                                                                {formatCurrency(row.Total)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-2 pb-4">
                                                <div className="pt-2 border-t mt-2">
                                                    {renderDetails(row)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                            <div className="flex justify-end mt-6 px-4">
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">
                                        {hasAccRecTransactions ? 'Net Total Spend' : 'Total Spend'}
                                    </p>
                                    <p className="text-2xl font-bold">{formatCurrency(netTotalSpend)}</p>
                                    {hasAccRecTransactions && netTotalSpend !== (statement.data.totalSpend ?? 0) && (
                                        <p className="text-sm text-muted-foreground line-through mt-1">
                                            {formatCurrency(statement.data.totalSpend ?? 0)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}