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
                const parsedDate = parseDate(data.Date, 'dd MMM yyyy', new Date());
                
                records.push({
                    Date: parsedDate.getTime(),
                    Merchant: cleanNames(data.Description),
                    Amount: parseFloat(data.Amount),
                });
            } catch (error) {
                console.error(`Error parsing date for record: ${data.Date}`, error);
                records.push({
                    Date: Date.now(),
                    Merchant: cleanNames(data.Description),
                    Amount: parseFloat(data.Amount),
                });
            }
        })
        .on('end', () => {
            const sortedRecords = records.sort((a, b) => a.Date - b.Date);
            resolve(sortedRecords);
        })
        .on('error', (error) => reject(error));
    });
}

export function cleanNames(name: string): string {
    // Step 1: Remove URLs and email-like patterns
    let cleaned = name.replace(/\b(?:WWW|HTTP|HTTPS|COM|CA)\b|[.@]/gi, '');
    
    // Step 2: Remove store/reference numbers and special characters
    cleaned = cleaned.replace(/[#*=]\d+|\(\d+\)|\d+/g, '');
    
    // Step 3: Remove cities from the predefined list
    const cityPattern = new RegExp(`\\b(${CITY_NAMES.join('|')})\\b`, 'gi');
    cleaned = cleaned.replace(cityPattern, '');
    
    // Step 4: Remove excessive whitespace and trim
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    
    // Step 5: Take only the first 3-4 significant words (adjustable)
    cleaned = cleaned.split(' ').slice(0, 4).join(' ');
    
    // Step 6: Final cleanup of any remaining special characters
    cleaned = cleaned.replace(/[^a-zA-Z\s]/g, '');
    
    // Step 7: Final trim and standardize spaces
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

    return Object.entries(summary)
        .map(([category, data]) => {
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
        })
        .sort((a, b) => b.Total - a.Total);
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

