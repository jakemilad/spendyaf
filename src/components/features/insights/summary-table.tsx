"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { TrendingUp, TrendingDown, AlertCircle, Maximize2, ExternalLink, DollarSign, Save, X, Loader2 } from "lucide-react";
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

export function SummaryTable({ statement: initialStatement, categoryBudgets }: SummaryTableProps) {
    const router = useRouter();
    const [currentStatement, setCurrentStatement] = useState<DbStatement>(initialStatement);
    const [isProMode, setIsProMode] = useState(false);
    const [pendingChanges, setPendingChanges] = useState<Record<string, number>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [showAccRecInputs, setShowAccRecInputs] = useState(false);
    
    useEffect(() => {
        setCurrentStatement(initialStatement);
    }, [initialStatement]);

    const sortedSummary = Array.isArray(currentStatement.data?.summary) 
        ? [...currentStatement.data.summary].sort((a, b) => {
            const aTotal = a.NetTotal ?? a.Total;
            const bTotal = b.NetTotal ?? b.Total;
            return bTotal - aTotal;
        })
        : [];
    const budgets = categoryBudgets ?? currentStatement.data?.budgets ?? {}

    const netTotalSpend = currentStatement.data?.netTotal ?? currentStatement.data.totalSpend ?? 0;
    const hasAccRecTransactions = currentStatement.data?.transactions?.some(t => (t.AccRec ?? 0) > 0) ?? false;

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    const handleSaveChanges = async () => {
        setIsSaving(true);
        let successCount = 0;
        let lastUpdatedStatement: any = null;

        try {
            for (const [key, newAccRec] of Object.entries(pendingChanges)) {
                const parts = key.split('|');
                if (parts.length !== 4) {
                    console.error(`Invalid key format: ${key}`);
                    continue;
                }
                
                const merchant = parts[0];
                const date = Number(parts[1]);
                const amount = Number(parts[2]);
                
                const transaction: Transaction = {
                    Date: date,
                    Amount: amount,
                    Merchant: merchant
                };

                const result = await updateTransasctionAccRec(Number(currentStatement.id), transaction, newAccRec);
                
                if (result.success) {
                    successCount++;
                    if (result.updatedStatement) {
                        lastUpdatedStatement = result.updatedStatement;
                    }
                }
            }

            if (successCount > 0) {
                toast.success(`Saved ${successCount} update${successCount !== 1 ? 's' : ''}`);
                setPendingChanges({});
                if (lastUpdatedStatement) {
                    setCurrentStatement(prev => ({
                        ...prev,
                        data: lastUpdatedStatement
                    }));
                }
                router.refresh();
            } else {
                toast.error("Failed to save changes");
            }
        } catch (error) {
            toast.error("Error saving changes");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelChanges = () => {
        setPendingChanges({});
        setShowAccRecInputs(false);
    };

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
        
        const transactionsArray = (currentStatement.data.transactions || [])
            .filter(t => {
                const cat = currentStatement.data.categories[t.Merchant] || 'unknown';
                return cat === row.Category;
            })
            .sort((a, b) => b.Date - a.Date); // descending
            
        const transactionCount = transactionsArray.length
        const averageSpend = transactionCount > 0 ? effectiveTotal / transactionCount : 0
        const topTransaction = [...transactionsArray].sort((a, b) => (b.NetSpend ?? b.Amount) - (a.NetSpend ?? a.Amount))[0];
        
        const totalAmount = transactionsArray.reduce((sum, t) => {
            const netSpend = t.NetSpend ?? t.Amount;
            return sum + netSpend;
        }, 0);

        const merchantGroups = transactionsArray.reduce((acc, t) => {
            const current = acc[t.Merchant] || { count: 0, total: 0, name: t.Merchant };
            current.count += 1;
            current.total += (t.NetSpend ?? t.Amount);
            acc[t.Merchant] = current;
            return acc;
        }, {} as Record<string, { count: number, total: number, name: string }>);

        const repeatedMerchants = Object.values(merchantGroups)
            .filter(g => g.count > 1)
            .sort((a, b) => b.total - a.total);

        return (
            <div className="flex flex-col h-full overflow-hidden space-y-3 pt-1">
                <div className="flex-shrink-0 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-md border border-border/40 bg-muted/20 p-2 text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {effectiveTotal !== row.Total ? 'Net' : 'Total'}
                            </p>
                            <p className="text-sm font-semibold">
                                {formatCurrency(effectiveTotal)}
                            </p>
                            {effectiveTotal !== row.Total && (
                                <p className="text-[10px] text-muted-foreground line-through">
                                    {formatCurrency(row.Total)}
                                </p>
                            )}
                        </div>
                        <div className="rounded-md border border-border/40 bg-muted/20 p-2 text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Transactions
                            </p>
                            <p className="text-sm font-semibold">
                                {transactionCount}
                            </p>
                        </div>
                        <div className="rounded-md border border-border/40 bg-muted/20 p-2 text-center">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Avg
                            </p>
                            <p className="text-sm font-semibold">
                                {formatCurrency(averageSpend)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {budgetTarget && (
                            <div className="rounded-md border border-border/40 bg-card/40 p-2 shadow-sm flex flex-col justify-center">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Budget</span>
                                    <span className="text-xs font-semibold">{formatCurrency(budgetTarget)}</span>
                                </div>
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
                        )}
                        {topTransaction && (
                            <div className={cn(
                                "rounded-md border border-border/40 bg-card/60 p-2 shadow-sm flex items-center justify-between gap-2",
                                !budgetTarget && "col-span-2"
                            )}>
                                <div className="min-w-0">
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Largest</p>
                                    <p className="text-xs font-medium truncate">{topTransaction.Merchant}</p>
                                </div>
                                <span className="flex-shrink-0 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                                    {formatCurrency(topTransaction.NetSpend ?? topTransaction.Amount)}
                                </span>
                            </div>
                        )}
                    </div>

                    {repeatedMerchants.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                Frequent Merchants
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {repeatedMerchants.map((merchant) => (
                                    <div 
                                        key={merchant.name} 
                                        className="flex flex-col rounded-md border border-border/40 bg-card/40 p-2"
                                    >
                                        <div className="flex justify-between items-start gap-1">
                                            <p className="text-xs font-medium truncate flex-1">
                                                {merchant.name}
                                            </p>
                                            <span className="text-[11px] text-muted-foreground bg-muted/50 px-1 rounded">
                                                {merchant.count}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold tabular-nums mt-0.5">
                                            {formatCurrency(merchant.total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-1">
                        <div className="flex items-center justify-between min-h-[28px]">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                All Transactions
                            </p>
                            <div className="flex items-center gap-2">
                                {hasPendingChanges ? (
                                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-5 duration-200">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={handleCancelChanges}
                                            className="h-6 px-2 text-[10px] text-muted-foreground hover:text-foreground"
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={handleSaveChanges}
                                            disabled={isSaving}
                                            className="h-6 px-2.5 text-[10px] gap-1.5 font-medium bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                                        >
                                            {isSaving ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Save className="h-3 w-3" />
                                            )}
                                            Save Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <Checkbox 
                                            id="show-accrec" 
                                            checked={showAccRecInputs}
                                            onCheckedChange={(checked) => setShowAccRecInputs(checked === true)}
                                            className="h-3.5 w-3.5"
                                        />
                                        <Label 
                                            htmlFor="show-accrec" 
                                            className="text-[10px] text-muted-foreground cursor-pointer font-medium"
                                        >
                                            Edit
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Separator className="mt-1" />
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2 -mr-2">
                    <div className="space-y-2 pb-2">

                    {transactionsArray.map((tx, index) => {
                        const inputKey = `${tx.Merchant}|${tx.Date}|${tx.Amount}|${index}`;
                        const pendingVal = pendingChanges[inputKey];
                        const currentAccRec = pendingVal !== undefined ? pendingVal : (tx.AccRec ?? 0);
                        const netSpend = tx.Amount - currentAccRec;
                        const hasAdjustment = currentAccRec > 0;
                        const isModified = pendingVal !== undefined && pendingVal !== (tx.AccRec ?? 0);
                        
                        return (
                            <div
                                key={inputKey}
                                className={cn(
                                    "group rounded-lg border p-3 transition-all",
                                    isModified ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/10 border-border/40 hover:bg-muted/30"
                                )}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <span className="text-xs font-medium text-muted-foreground/50 w-5 flex-shrink-0 flex justify-center">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="text-sm font-semibold truncate leading-none">
                                                    {tx.Merchant}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground font-medium px-1.5 py-0.5 rounded-full bg-background/50 border border-border/50">
                                                    {new Date(tx.Date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {showAccRecInputs ? (
                                        <div className={cn(
                                            "flex items-center gap-3 flex-shrink-0 p-1.5 rounded-md border",
                                            isModified ? "bg-white dark:bg-black border-emerald-500/30" : "bg-background/50 border-border/40"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                <label htmlFor={inputKey} className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                                    Money In
                                                </label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                                    <Input
                                                        id={inputKey}
                                                        type="number"
                                                        step="0.01"
                                                        min={tx.Amount < 0 ? tx.Amount : 0}
                                                        max={tx.Amount < 0 ? 0 : tx.Amount}
                                                        placeholder="0.00"
                                                        value={currentAccRec === 0 ? "" : currentAccRec}
                                                        onChange={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            setPendingChanges(prev => ({
                                                                ...prev,
                                                                [inputKey]: isNaN(val) ? 0 : val
                                                            }));
                                                        }}
                                                        onFocus={(e) => e.target.select()}
                                                        disabled={isSaving}
                                                        className="w-24 h-8 pl-5 text-xs font-medium bg-background"
                                                    />
                                                </div>
                                            </div>
                                            <Separator orientation="vertical" className="h-6" />
                                            <div className="flex flex-col items-end min-w-[80px] px-1">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                                    Net
                                                </span>
                                                <span className={cn(
                                                    "text-sm font-bold tabular-nums leading-none",
                                                    netSpend !== tx.Amount ? "text-emerald-600" : ""
                                                )}>
                                                    {formatCurrency(netSpend)}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-3 text-right">
                                            {hasAdjustment && (
                                                <>
                                                    <span className="text-xs text-muted-foreground line-through decoration-muted-foreground/50">
                                                        {formatCurrency(tx.Amount)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                                                        <DollarSign className="h-3 w-3" />
                                                        {formatCurrency(currentAccRec).replace('$', '')} in
                                                    </span>
                                                </>
                                            )}
                                            <span className={cn(
                                                "text-base font-bold tabular-nums min-w-[80px]",
                                                hasAdjustment ? "text-emerald-600" : ""
                                            )}>
                                                {formatCurrency(netSpend)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    </div>
                </div>
                <div className="flex-shrink-0 flex justify-between items-center pt-2 border-t mt-auto">
                    <span className="font-semibold text-sm">Total</span>
                    <span className="text-xl font-bold tabular-nums">
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
                                {currentStatement.data?.fileName || 'Unknown'} Statement Summary
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
                                        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
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
                                        {hasAccRecTransactions && netTotalSpend !== (currentStatement.data.totalSpend ?? 0) && (
                                            <span className="text-xs text-muted-foreground line-through">
                                                {formatCurrency(currentStatement.data.totalSpend ?? 0)}
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
                                {currentStatement.data?.fileName || 'Unknown'} - Extended Summary
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
                                    {hasAccRecTransactions && netTotalSpend !== (currentStatement.data.totalSpend ?? 0) && (
                                        <p className="text-sm text-muted-foreground line-through mt-1">
                                            {formatCurrency(currentStatement.data.totalSpend ?? 0)}
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