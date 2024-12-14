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
import { DbStatement } from "@/app/types/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryTableProps {
    statement: DbStatement;
}

export function SummaryTable({ statement }: SummaryTableProps) {

    return (
        <div className="h-full w-full">
            <Card className="h-full">
                <CardContent>
                    <Table>
                        <TableCaption className="text-center font-medium text-xl text-muted-foreground mb-4 caption-top">
                            {statement.data.fileName} Statement Summary
                        </TableCaption>
                        <TableHeader>
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="w-[40%] py-3 pl-2">Category</TableHead>
                                <TableHead className="w-[30%] text-left pr-2">Largest Transaction</TableHead>
                                <TableHead className="w-[30%] text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {statement.data.summary.map((row) => (
                                <Dialog key={row.Category}>
                                    <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer hover:bg-accent/50">
                                            <TableCell className="text-left font-medium">{row.Category}</TableCell>
                                            <TableCell className="text-left">
                                                {row.BiggestTransaction.merchant.split(' ').slice(0, 2).join(' ')}
                                                <span className="text-xs text-muted-foreground block">
                                                    ${row.BiggestTransaction.amount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">${row.Total}</TableCell>
                                        </TableRow>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="text-center font-bold text-xl mb-5">
                                                {row.Category} Transactions
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="max-h-[60vh] overflow-y-auto">
                                            <ul className="list-disc pl-6 space-y-2">
                                                {Object.entries(row.Transactions).map(([transaction, count]) => (
                                                    <li key={transaction}>
                                                        {transaction.charAt(0).toUpperCase() + transaction.slice(1).toLowerCase()}: ${count}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell>Total</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right">${statement.data.totalSpend}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}