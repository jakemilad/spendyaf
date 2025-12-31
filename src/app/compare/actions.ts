import { getSession, getUserCategories } from "../actions";
import { DbStatement } from "../types/types";
import { CategorySummary } from "../types/types";

export async function compareStatements(statements: DbStatement[]): Promise<{ data: any[], months: string[] }> {
    try {
        const session = await getSession();
        if(!session?.user?.email) return { data: [], months: [] };

        const allCategories = await getUserCategories();

        const months = statements?.map(s => s.file_name.split('.')[0]) || [];
        
        return {
            data: Array.from(allCategories).map(category => {
                const dataPoint: { category: string; [key: string]: number | string } = { 
                    category 
                };
                
                statements?.forEach(statement => {
                    const monthName = statement.file_name.split('.')[0];
                    const summary = Array.isArray(statement.data?.summary) ? statement.data.summary : [];
                    const categoryData = summary.find(
                        (item: CategorySummary) => item.Category === category
                    );
                    dataPoint[monthName] = categoryData ? Math.max(0, categoryData.Total) : 0;
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
    const sortedStatements = statements.sort((a, b) => a.data.transactions[0].Date - b.data.transactions[0].Date);

    // chart data of average spend for each statement
    const averageSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            weeklyAverage: statement.data?.insights?.averageSpend?.weekly || 0,
        }
    });

    const totalSpendChartData = sortedStatements.map(statement => {
        return {
            date: statement.file_name,
            totalSpend: statement.data?.totalSpend || 0,
        }
    });

    const spendingVolatilityChartData = sortedStatements.map(s => {
        const transactions = Array.isArray(s.data?.transactions) ? s.data.transactions : [];
        if (transactions.length === 0) {
            return {
                date: s.file_name,
                spendVol: 0
            }
        }
        const amount = transactions.map(t => t.Amount);
        const mean = amount.reduce((a,b) => a+b, 0) / amount.length;
        const variance = amount.reduce((sum, amount)=> sum + Math.pow(amount - mean, 2), 0) / amount.length;
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