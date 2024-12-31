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
        <section>
                <Card>
                    <CardHeader>
                    <CardTitle>Monthly Spending by Category</CardTitle>
                <CardDescription>
                    Comparing {months.join(', ')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <YAxis
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" className="text-lg"/>}
                        />
                        <Legend 
                            verticalAlign="top" 
                            height={36}
                            formatter={(value) => <span className="text-md">{value}</span>}
                        />
                        {months.map((month, index) => (
                            <Bar 
                                key={month}
                                name={month}
                                dataKey={month}
                                fill={COLORS[index % COLORS.length]}
                                radius={4}
                            />
                        ))}
                    </BarChart>
                    </ChartContainer>
                    </CardContent>
                </Card>
        </section>
    );
}