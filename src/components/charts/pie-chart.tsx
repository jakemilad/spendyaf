"use client"
import * as React from 'react'
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"
import { useState } from "react";
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
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DbStatement } from "@/app/types/types"

interface PieChartProps {
    statement: DbStatement
}

export function PieChartComponent({ statement }: PieChartProps) {
    const id = 'pie-interactive'
    
    const sortedCategories = React.useMemo(() => {
        return [...statement.data.summary]
            .sort((a, b) => b.Total - a.Total)
            .map(item => item.Category)
    }, [statement.data.summary])

    const [activeCategory, setActiveCategory] = useState(sortedCategories[0])
    
    const activeIndex = React.useMemo(() => 
        statement.data.summary.findIndex(item => item.Category === activeCategory), 
        [activeCategory, statement.data.summary]
    )

    const COLORS = [
        "#FF5733", // Vivid Orange
        "#33FF57", // Bright Green
        "#3357FF", // Strong Blue
        "#FF33A1", // Hot Pink
        "#33FFF5", // Cyan
        "#FFC733", // Bright Yellow
        "#B833FF", // Vibrant Purple
        "#FF5733", // Bright Red-Orange
        "#33FF8A", // Aqua Green
        "#FF9F33", // Orange-Yellow
        "#75FF33", // Lime
        "#338AFF", // Sky Blue
        "#FF33C7", // Fuchsia
        "#8A33FF", // Deep Purple
        "#FF3333", // Bright Red
        "#33FFC4", // Mint
        "#FFA733", // Gold
        "#57FF33", // Apple Green
        "#5733FF", // Indigo
        "#FF33FF"  // Magenta
      ];

    const calculatePercentage = (total: number) => {
        return ((total / (statement.data.totalSpend || 0)) * 100).toFixed(2);
    };

    const chartData = statement.data.summary.map((item, index) => ({
        category: item.Category.toLowerCase(),
        percentage: parseFloat(calculatePercentage(item.Total)),
        total: item.Total,
        fill: COLORS[index]
    }));

    const chartConfig: ChartConfig = statement.data.summary.reduce((acc, item, index) => ({
        ...acc,
        [item.Category.toLowerCase()]: {
            label: `${item.Category} (${calculatePercentage(item.Total)}%)`,
            color: COLORS[index],
        }
    }), {}) satisfies ChartConfig;

    return (
        <Card data-chart={id} className='flex flex-col h-full'>
            <ChartStyle id={id} config={chartConfig} />
            <CardHeader className='flex-row items-start space-y-0 pb-0'>
                <div>
                    <CardTitle>Category Percentage Spend</CardTitle>
                    <CardDescription className="mt-2">{statement.data.fileName}</CardDescription>
                </div>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger
                        className='ml-auto h-7 w-[130px] rounded-lg pl-2.5'
                        aria-label="Select a value"
                    >
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent align="end" className='rounded-xl'>
                        {sortedCategories.map((key) => {
                            const config = chartConfig[key.toLowerCase() as keyof typeof chartConfig]
                            if(!config) return null;
                            return(
                                <SelectItem key={key} value={key} className='rounded-lg [&_span]:flex'>
                                    <div className='flex items-center gap-2 text-xs'>
                                        <span
                                            className='flex h-3 w-3 shrink-0 rounded-sm'
                                            style={{backgroundColor: config.color}}
                                        />
                                        {config.label}
                                    </div>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>
            </CardHeader>
            <CardContent className="flex flex-1 justify-center pb-0">
                <ChartContainer
                    id={id}
                    config={chartConfig}
                    className='mx-auto aspect-square w-full max-w-[300px]'
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={chartData} dataKey="percentage" nameKey="category" activeIndex={activeIndex} innerRadius={60} strokeWidth={5}
                        activeShape={({
                            outerRadius = 0,
                            ...props
                          }: PieSectorDataItem) => (
                            <g>
                              <Sector {...props} outerRadius={outerRadius + 10} />
                              <Sector
                                {...props}
                                outerRadius={outerRadius + 25}
                                innerRadius={outerRadius + 12}
                              />
                            </g>
                          )}
                        >
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-xl font-bold">
                                                    {`$${statement.data.totalSpend?.toLocaleString()}`}
                                                </tspan>
                                                <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                                                    Total Spend
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}