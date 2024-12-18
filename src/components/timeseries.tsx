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
    const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("allTransactions")
    const [selectedDate, setSelectedDate] = React.useState<string | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [selectedTransactions, setSelectedTransactions] = React.useState<Array<{Amount: number, Merchant: string}>>([])

    const total = React.useMemo(() => {
        return statement.data.transactions.reduce((acc, curr) => acc + curr.Amount, 0).toFixed(2)
    }, [statement.data.transactions])

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
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      })
    }

    const transactionsByDate = React.useMemo(() => {
      const grouped = new Map();
      statement.data.transactions.forEach(transaction => {
        const date = formatTimeStamp(transaction.Date);
        if(!grouped.has(date)) {
          grouped.set(date, [])
        }
        grouped.get(date).push(transaction)
      })
      return grouped;
    }, [statement.data.transactions])

    const handleBarClick = (data: any) => {
      const date = data.date
      setSelectedDate(date);
      setSelectedTransactions(transactionsByDate.get(date) || [])
      setIsDialogOpen(true)
    }

    const chartData = statement.data.transactions.map(item => ({
        date: formatTimeStamp(item.Date),
        allTransactions: item.Amount > 0 ? item.Amount : item.Amount * -1
    }))

    return (
      <>
        <Card>
            <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardTitle>{statement.data.fileName} Time Series</CardTitle>
                    <CardDescription>
                        Total transactions over time for {statement.data.fileName}
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
                                ${statement.data.totalSpend}
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
              {selectedTransactions.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">{transaction.Merchant}</span>
                  <span className="text-muted-foreground">${transaction.Amount}</span>
                </div>
              ))}
              <div className="flex justify-end">
                <span className="text-muted-foreground">Total:</span>
                <span className="ml-3 font-medium">
                  ${selectedTransactions.reduce((acc, curr) => acc + curr.Amount, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
}

