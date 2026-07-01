import { getSession, getUserCategories } from "../actions";
import { DbStatement, Transaction } from "../types/types";

const getNetSpend = (transaction: Transaction) =>
    transaction.NetSpend ?? (Number(transaction.Amount) - (transaction.AccRec || 0));

const getTransactions = (statement: DbStatement) =>
    Array.isArray(statement.data?.transactions) ? statement.data.transactions : [];

const getMonthName = (statement: DbStatement) =>
    statement.file_name.split('.')[0];

const getStatementNetTotal = (statement: DbStatement) =>
    getTransactions(statement).reduce((sum, transaction) => sum + getNetSpend(transaction), 0);

const getWeeklyAverage = (statement: DbStatement) => {
    const transactions = getTransactions(statement);
    if (transactions.length === 0) return 0;

    const dates = transactions.map(transaction => transaction.Date);
    const firstDate = Math.min(...dates);
    const lastDate = Math.max(...dates);
    const daysDiff = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const weeksDiff = Math.max(1, Math.ceil(daysDiff / 7));

    return Number((getStatementNetTotal(statement) / weeksDiff).toFixed(2));
};

const getCategoryNetTotals = (statement: DbStatement) => {
    const categories = statement.data?.categories ?? {};

    return getTransactions(statement).reduce((totals, transaction) => {
        const category = categories[transaction.Merchant] || 'unknown';
        totals[category] = (totals[category] || 0) + getNetSpend(transaction);
        return totals;
    }, {} as Record<string, number>);
};

export async function compareStatements(statements: DbStatement[]): Promise<{ data: any[], months: string[] }> {
    try {
        const session = await getSession();
        if(!session?.user?.email) return { data: [], months: [] };

        const userCategories = await getUserCategories();
        const statementCategories = statements.flatMap(statement =>
            Object.keys(getCategoryNetTotals(statement))
        );
        const allCategories = Array.from(new Set([...userCategories, ...statementCategories]));

        const months = statements?.map(getMonthName) || [];
        
        return {
            data: Array.from(allCategories).map(category => {
                const dataPoint: { category: string; [key: string]: number | string } = { 
                    category 
                };
                
                statements?.forEach(statement => {
                    const monthName = getMonthName(statement);
                    const categoryTotals = getCategoryNetTotals(statement);
                    dataPoint[monthName] = Math.max(0, Number((categoryTotals[category] || 0).toFixed(2)));
                });

                return dataPoint;
            }),
            months
        };
    } catch (error) {
        console.error('Error comparing statements:', error);
        return { data: [], months: [] };
    }
}

export async function compareStatementAreaChart(statements: DbStatement[]) {
    const sortedStatements = [...statements].sort((a, b) => {
        const aFirstDate = getTransactions(a)[0]?.Date || 0;
        const bFirstDate = getTransactions(b)[0]?.Date || 0;
        return aFirstDate - bFirstDate;
    });

    const averageSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            weeklyAverage: getWeeklyAverage(statement),
        }
    });

    const totalSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            totalSpend: Number(getStatementNetTotal(statement).toFixed(2)),
        }
    });

    const spendingVolatilityChartData = sortedStatements.map(s => {
        const transactions = getTransactions(s);
        if (transactions.length === 0) {
            return {
                date: s.file_name,
                spendVol: 0
            }
        }
        const amounts = transactions.map(getNetSpend);
        const mean = amounts.reduce((a,b) => a+b, 0) / amounts.length;
        const variance = amounts.reduce((sum, amount)=> sum + Math.pow(amount - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance)

        return {
            date: s.file_name,
            spendVol: Number(stdDev.toFixed(2))
        }
    })
    
    return {
        weeklyAverage: averageSpendChartData,
        totalSpend: totalSpendChartData,
        spendVol: spendingVolatilityChartData
    } 
}
