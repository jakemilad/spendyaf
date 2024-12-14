import { Transaction } from "@/app/types/types";
import { CITY_NAMES } from "@/app/utils/dicts";
import { parse } from "csv-parse";
import { CategorySummary, SummaryMap } from "@/app/types/types";

import { parse as parseDate } from 'date-fns';

export async function processCSV(file: Buffer): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
        const records: Transaction[] = [];
        parse(file, {
            columns: true,
            skip_empty_lines: true
        })
        .on('data', (data: any) => {
            try {
                // Parse date in format "DD MMM YYYY"
                const parsedDate = parseDate(data.Date, 'dd MMM yyyy', new Date());
                
                records.push({
                    Date: parsedDate.getTime(), // Store as timestamp
                    Merchant: cleanNames(data.Description),
                    Amount: parseFloat(data.Amount),
                });
            } catch (error) {
                console.error(`Error parsing date for record: ${data.Date}`, error);
                // Use current date as fallback
                records.push({
                    Date: Date.now(),
                    Merchant: cleanNames(data.Description),
                    Amount: parseFloat(data.Amount),
                });
            }
        })
        .on('end', () => resolve(records))
        .on('error', (error) => reject(error));
    });
}

export function cleanNames(name: string): string {
    const pattern = new RegExp(`\\b(${CITY_NAMES.join('|')})\\b`, 'gi');
    let cleaned = name.replace(pattern, '');
    cleaned = cleaned.replace(/\d+/g, '');
    cleaned = cleaned.replace(/[^a-zA-Z\s]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
}

export function summarizeSpendByCategory(transactions: Transaction[], categoriesMap: Record<string, string>): CategorySummary[] {
    let summary: SummaryMap = {};
    let transactionCounts: Record<string, Record<string, number>> = {};
    
    for(const transaction of transactions) {
        const category = categoriesMap[transaction.Merchant] || 'unknown';
        
        if(!(category in summary)) {
            summary[category] = {
                total: 0,
                transactions: {},
                biggestTransaction: { merchant: '', amount: 0 },
            };
            transactionCounts[category] = {};
        }
        
        transactionCounts[category][transaction.Merchant] = (transactionCounts[category][transaction.Merchant] || 0) + 1;
        summary[category].total += Number(transaction.Amount) || 0;
        
        const currentAmount = Number(transaction.Amount) || 0;
        if (currentAmount > summary[category].biggestTransaction.amount) {
            summary[category].biggestTransaction = { 
                merchant: transaction.Merchant, 
                amount: currentAmount 
            };
        }

        const baseAmount = summary[category].transactions[transaction.Merchant] || 0;
        summary[category].transactions[transaction.Merchant] = baseAmount + (Number(transaction.Amount) || 0);
    }

    return Object.entries(summary).map(([category, data]) => {
        const formattedTransactions: { [key: string]: number } = {};
        
        Object.entries(data.transactions).forEach(([merchant, amount]) => {
            const count = transactionCounts[category][merchant];
            if(count > 1){
                const merchantWithCount = `${merchant} (${count})`;
                formattedTransactions[merchantWithCount] = Number(amount.toFixed(2));
            } else {
                formattedTransactions[merchant] = Number(amount.toFixed(2));
            }
        });

        return {
            Category: category,
            Total: Number(data.total.toFixed(2)),
            Transactions: formattedTransactions,
            BiggestTransaction: {
                merchant: data.biggestTransaction.merchant,
                amount: Number(data.biggestTransaction.amount.toFixed(2))
            }
        };
    });
}


// export function summarizeSpendByCategory(transactions: Transaction[], categoriesMap: Record<string, string>): CategorySummary[] {
//     let summary: SummaryMap = {};
//     let transactionCounts: Record<string, Record<string, number>> = {};
    
//     for(const transaction of transactions) {
//         const category = categoriesMap[transaction.Merchant] || 'unknown';
        
//         if(!(category in summary)) {
//             summary[category] = {
//                 total: 0,
//                 transactions: {}
//             };
//             transactionCounts[category] = {};
//         }
        
//         transactionCounts[category][transaction.Merchant] = (transactionCounts[category][transaction.Merchant] || 0) + 1;
//         summary[category].total += Number(transaction.Amount) || 0;
        
//         const baseAmount = summary[category].transactions[transaction.Merchant] || 0;
//         summary[category].transactions[transaction.Merchant] = baseAmount + (Number(transaction.Amount) || 0);
//     }

//     return Object.entries(summary).map(([category, data]) => {
//         const formattedTransactions: { [key: string]: number } = {};
        
//         Object.entries(data.transactions).forEach(([merchant, amount]) => {
//             const count = transactionCounts[category][merchant];
//             if(count > 1){
//                 const merchantWithCount = `${merchant} (${count})`;
//                 formattedTransactions[merchantWithCount] = Number(amount.toFixed(2));
//             } else {
//                 formattedTransactions[merchant] = Number(amount.toFixed(2));
//             }
//         });

//         return {
//             Category: category,
//             Total: Number(data.total.toFixed(2)),
//             Transactions: formattedTransactions
//         };
//     });
// }
