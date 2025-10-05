'use client';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

interface ViewType {
  value: string;
  label: string;
  dataKey: string;
  dataSource: 'weeklyAverage' | 'totalSpend' | 'spendVol';
}

const VIEW_TYPES: ViewType[] = [
  {
    value: 'average',
    label: 'Weekly Average',
    dataKey: 'weeklyAverage',
    dataSource: 'weeklyAverage'
  },
  {
    value: 'total',
    label: 'Total Spend',
    dataKey: 'totalSpend',
    dataSource: 'totalSpend'
  },
  {
    value: 'volatility',
    label: 'Volatility',
    dataKey: 'spendVol',
    dataSource: 'spendVol',
  },
];

const chartConfig = {
    spend: {
        label: "Spend",
    },
    ...VIEW_TYPES.reduce((acc, type) => ({
        ...acc,
        [type.value]: {
            label: type.label,
            color: "hsl(var(--chart-1))"
        }
    }), {})
} satisfies ChartConfig;

export default function AreaChartCompare({ areaChartData }: any) {
    const [viewType, setViewType] = React.useState<ViewType>(VIEW_TYPES[0]);

    const chartData = areaChartData[viewType.dataSource];

    return (
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                View your spending patterns across months
              </CardDescription>
            </div>
            <Select 
              value={viewType.value} 
              onValueChange={(value) => setViewType(VIEW_TYPES.find(t => t.value === value)!)}
            >
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select view type"
              >
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {VIEW_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="rounded-lg">
                        {type.label}
                    </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-1 pt-2 sm:px-3 sm:pt-3">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[400px] w-full"
            >
              <AreaChart 
                data={chartData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={5}
                  scale="point"
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `$${value}`}
                  />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => `$${Number(value).toFixed(2)}`}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey={viewType.dataKey}
                  type="monotone"
                  fill="url(#fillSpend)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
    );
}