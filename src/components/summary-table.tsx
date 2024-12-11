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

interface SummaryTableProps {
    statement: DbStatement;
}

export function SummaryTable({ statement }: SummaryTableProps) {

    return (
        <div className="w-full max-w-md mx-auto">
            <Table>
                <TableCaption className="text-center font-bold text-xl mb-5 caption-top">
                    Summary of your {statement.data.fileName} statement
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead style={{ width: '120px' }} className="text-left">Category</TableHead>
                        <TableHead style={{ width: '100px' }} className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {statement.data.summary.map((row) => (
                        <Dialog key={row.Category}>
                            <DialogTrigger asChild>
                                <TableRow className="cursor-pointer hover:text-gray-200">
                                    <TableCell className="font-medium">{row.Category}</TableCell>
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
                                                {transaction}: ${count}
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
                        <TableCell className="text-right">${statement.data.totalSpend}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}