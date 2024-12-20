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

    const descendingTransactions = () => {
        return statement.data.summary.sort((a, b) => b.Total - a.Total)
    }

    return (
        <div className="h-full w-full">
            <Card className="h-full">
                <CardContent className="p-5 -mt-4">
                    <Table>
                        <TableCaption className="text-left font-bold text-lg caption-top dark:text-white -mb-2">
                            {statement.data.fileName} Statement Summary
                        </TableCaption>
                        <TableCaption className="text-left font-bold text-sm mb-4 caption-top text-muted-foreground">
                            Categorized transactions powered by AI
                        </TableCaption>
                        <TableHeader>
                            <TableRow className="border-b border-border/50 hover:bg-transparent">
                                <TableHead className="w-[40%] py-4 pl-2 text-lg">Category</TableHead>
                                <TableHead className="w-[30%] text-left pr-2 text-lg">Largest Transaction</TableHead>
                                <TableHead className="w-[30%] text-right text-lg">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {descendingTransactions().map((row) => (
                                <Dialog key={row.Category}>
                                    <DialogTrigger asChild>
                                        <TableRow className="cursor-pointer hover:bg-accent/50">
                                            <TableCell className="text-left font-medium text-lg py-4">{row.Category}</TableCell>
                                            <TableCell className="text-left text-lg">
                                                {row.BiggestTransaction.merchant.split(' ').slice(0, 2).join(' ')}
                                                <span className="text-sm text-muted-foreground block mt-1">
                                                    ${row.BiggestTransaction.amount}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-lg">${row.Total}</TableCell>
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
                                                    <span className="text-muted-foreground">${count}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-end">
                                                <span className="text-muted-foreground">Total:</span>
                                                <span className="ml-3 font-medium">
                                                    ${Object.values(row.Transactions).reduce((sum, count) => sum + count, 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="text-lg">Total</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right text-lg">${statement.data.totalSpend}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}