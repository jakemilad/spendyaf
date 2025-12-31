"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DbStatement } from "@/app/types/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


const chartConfig = {
    views: {
        label: "Amount",
        color: "hsl(var(--chart-1))",
    },
    allTransactions: {
        label: "Transactions",
        color: "hsl(var(--chart-1))",
    }
} satisfies ChartConfig;

interface TransactionsChartProps {   
    statement: DbStatement
}


export default function TransactionsChart({statement}: TransactionsChartProps) {
    const transactions = Array.isArray(statement.data?.transactions) ? statement.data.transactions : [];
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("allTransactions")
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [selectedTransactions, setSelectedTransactions] = React.useState<Array<{Amount: number, Merchant: string, AccRec?: number}>>([])

    const formatTimeStamp = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        })
    }

    const formatSelectedDate = (date: string | null): string => {
      if(!date) return ""
      const [year, month, day] = date.split("-")
      return new Date(parseInt(year), parseInt(month)-1, parseInt(day)-1).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    }

    const transactionsByDate = React.useMemo(() => {
      const grouped = new Map();
      transactions.forEach(transaction => {
        const date = formatTimeStamp(transaction.Date);
        if(!grouped.has(date)) {
          grouped.set(date, [])
        }
        grouped.get(date).push(transaction)
      })
      return grouped;
    }, [transactions])

    const handleBarClick = (data: any) => {
      const date = data.date
      setSelectedDate(date);
      setSelectedTransactions(transactionsByDate.get(date) || [])
      setIsDialogOpen(true)
    }

    const chartData = React.useMemo(() => {
        const dailyTotals = new Map<string, number>();
        
        if (transactions.length === 0) {
            return [];
        }
        
        const dates = transactions.map(t => new Date(t.Date));
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        
        const currentDate = new Date(minDate);
        while (currentDate <= maxDate) {
            dailyTotals.set(formatTimeStamp(currentDate.getTime()), 0);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        transactions.forEach(item => {
            const date = formatTimeStamp(item.Date);
            const netSpend = item.Amount - (item.AccRec || 0);
            const amount = Math.abs(netSpend);
            dailyTotals.set(date, (dailyTotals.get(date) || 0) + amount);
        });

        return Array.from(dailyTotals.entries())
            .map(([date, amount]) => ({
                date,
                allTransactions: amount
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [transactions]);

    return (
      <>
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>{statement.data?.fileName || 'Unknown'} Time Series</CardTitle>
                    <CardDescription>
                        Total transactions over time for {statement.data?.fileName || 'Unknown'}
                    </CardDescription>
                </div>
                <div className="flex">
                {["allTransactions"].map((key) => {
                    const chart = key as keyof typeof chartConfig
                    return (
                        <button
                            key={chart}
                            data-active={activeChart === chart}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                            onClick={() => setActiveChart(chart)}
                        >
                            <span className="text-xs text-muted-foreground">
                                {chartConfig[chart].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                ${statement.data.netTotal ? statement.data.netTotal.toFixed(2) : statement.data.totalSpend?.toFixed(2) || 0}
                            </span>
                        </button>
                    )
                })}
            </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
            <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
            onClick={(data) => handleBarClick(data.activePayload?.[0]?.payload)}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                            })
                        }}
                    />
                    }
                />
                <Bar 
                    dataKey={activeChart}
                        fill={chartConfig[activeChart].color}
                    />
                </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-center font-bold text-xl pb-4">
                Transactions for {formatSelectedDate(selectedDate)}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTransactions.map((transaction, index) => {
                const netSpend = transaction.Amount - (transaction.AccRec || 0);
                const hasAccRec = (transaction.AccRec || 0) > 0;
                return (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">{transaction.Merchant}</span>
                    <div className="flex items-center gap-2">
                      {hasAccRec && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${Math.abs(transaction.Amount).toFixed(2)}
                        </span>
                      )}
                      <span className={hasAccRec ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                        ${Math.abs(netSpend).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-end">
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-3 font-medium">
                  ${selectedTransactions.reduce((acc, curr) => {
                    const netSpend = curr.Amount - (curr.AccRec || 0);
                    return acc + Math.abs(netSpend);
                  }, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
}
