export interface Transaction {
    Date: number; // Unix timestamp in milliseconds
    Merchant: string;
    Amount: number;
}

export interface CategorySummary {
    Category: string;
    Total: number;
    Transactions: {[merchant: string]: number};
    totalSpend?: number;
    BiggestTransaction: {merchant: string, amount: number};
}

export interface CategoryData {
    total: number;
    transactions: {[merchant: string]: number};
    biggestTransaction: {merchant: string, amount: number};
}

export interface SummaryMap {
    [category: string]: CategoryData;
}

export interface UploadResult {
    success: boolean;
    data?: {
        summary: CategorySummary[];
        categories: any;
        transactions: Transaction[];
        fileName: string;
        totalSpend?: number;
    };
    fileName?: string;
    error?: string;
}

export interface Statement {
    summary: CategorySummary[];
    categories: any;
    transactions: Transaction[];
    fileName: string;
    totalSpend?: number;
}

export interface DbStatement {
    id: string;
    file_name: string;
    created_at: string;
    data: Statement;
    totalSpend?: number;
}