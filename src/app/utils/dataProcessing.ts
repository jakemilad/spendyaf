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

export function getInsights(transactions: Transaction[], categorySummary: CategorySummary[]): any {

    const biggestCategorySpend = () => {
        let biggestCategory = "";
        let biggestSpend = 0;

        for(const category of categorySummary) {
            const curr = category.Total;
            if(curr > biggestSpend) {
                biggestSpend = curr;
                biggestCategory = category.Category;
            }
        }
        return {
            category: biggestCategory,
            total: biggestSpend
        }
    }

    const biggestTransaction = () => {
        let biggestTransaction = "";
        let biggestSpend = 0;

        for(const transaction of transactions) {
            const curr = transaction.Amount;
            if(curr > biggestSpend) {
                biggestSpend = curr;
                biggestTransaction = transaction.Merchant;
            }
        }
        return {
            merchant: biggestTransaction,
            amount: biggestSpend
        }
    }

    const mostFrequentTransaction = () => {
        const freqMap: Record<string, number> = {};

        for(const transaction of transactions) {
            freqMap[transaction.Merchant] = (freqMap[transaction.Merchant] || 0) + 1;
        }

        let mostFrequentMerchant: string = "";
        let highestFrequency = 0;
        let totalAmount = 0;

        for (const [merchant, frequency] of Object.entries(freqMap)) {
            if(frequency > highestFrequency) {
                highestFrequency = frequency;
                mostFrequentMerchant = merchant;
            }
            totalAmount += frequency;
        }

        totalAmount = transactions.filter(t => t.Merchant === mostFrequentMerchant).reduce((sum, t) => sum + t.Amount, 0);

        return {
            merchant: mostFrequentMerchant,
            frequency: highestFrequency,
            total: totalAmount
        }
    }

    const averageSpend = () => {
        if (transactions.length === 0) return 0;

        const dates = transactions.map(t => t.Date);
        const firstDate = Math.min(...dates);
        const lastDate = Math.max(...dates);

        const totalSpend = transactions.reduce((sum, t) => sum + t.Amount, 0);

        const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        const weeksDiff = Math.ceil(daysDiff / 7);

        return {
            daily: Number((totalSpend / daysDiff).toFixed(2)),
            weekly: Number((totalSpend / weeksDiff).toFixed(2))
        }
    }
    
    return {
        biggestCategorySpend: biggestCategorySpend(),
        biggestTransaction: biggestTransaction(),
        mostFrequentTransaction: mostFrequentTransaction(),
        averageSpend: averageSpend()
    }
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

