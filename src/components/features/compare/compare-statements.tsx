'use client'
import { ChartConfig } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, Legend, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CompareStatementsProps {
    data: Array<{
        category: string,
        [month: string]: number | string
    }>;
    months: string[];
}

const COLORS = [
    "hsl(230, 85%, 60%)", // Blue
    "hsl(330, 85%, 60%)", // Pink
    "hsl(130, 85%, 60%)", // Green
    "hsl(30, 85%, 60%)",  // Orange
    "hsl(280, 85%, 60%)", // Purple
    "hsl(180, 85%, 60%)", // Teal
    "hsl(80, 85%, 60%)",  // Lime
    "hsl(0, 85%, 60%)",   // Red
    "hsl(200, 85%, 60%)", // Sky Blue
    "hsl(300, 85%, 60%)", // Magenta
    "hsl(150, 85%, 60%)", // Emerald
    "hsl(50, 85%, 60%)",  // Yellow
];

export default function CompareStatements({ data, months }: CompareStatementsProps) {

    const chartConfig = months.reduce((config, month: any, index: any) => {
        config[month] = {
            label: month,
            color: COLORS[index]
        }
        return config;
    }, {} as ChartConfig)


    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl">Monthly Spending by Category</CardTitle>
                <CardDescription className="text-sm">
                    Comparing spending across {months.join(', ')}
                </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <BarChart 
                        data={data} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        className="w-full"
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.4} />
                        <XAxis
                            dataKey="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                            interval={0}
                        />
                        <YAxis
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            fontSize={12}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" className="text-sm"/>}
                        />
                        <Legend 
                            verticalAlign="top" 
                            height={40}
                            wrapperStyle={{ paddingBottom: '20px' }}
                            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
                        />
                        {months.map((month, index) => (
                            <Bar 
                                key={month}
                                name={month}
                                dataKey={month}
                                fill={COLORS[index % COLORS.length]}
                                radius={[2, 2, 0, 0]}
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}