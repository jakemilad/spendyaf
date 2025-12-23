'use client'
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChartConfig } from "@/components/ui/chart";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, Legend, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

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
    const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set(months.slice(0, 5)));
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
        new Set(data.map(item => item.category))
    );
    const [showFilters, setShowFilters] = useState(false);
    
    const categories = useMemo(() => data.map(item => item.category), [data]);

    const filteredData = useMemo(() => {
        return data.filter(item => selectedCategories.has(item.category));
    }, [data, selectedCategories]);

    const chartConfig = months.reduce((config, month: any, index: any) => {
        config[month] = {
            label: month,
            color: COLORS[index]
        }
        return config;
    }, {} as ChartConfig)

    const toggleMonth = (month: string) => {
        setSelectedMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(month)) {
                newSet.delete(month);
            } else {
                newSet.add(month);
            }
            return newSet;
        });
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const toggleAllMonths = () => {
        if (selectedMonths.size === months.length) {
            setSelectedMonths(new Set());
        } else {
            setSelectedMonths(new Set(months));
        }
    };

    const toggleAllCategories = () => {
        if (selectedCategories.size === categories.length) {
            setSelectedCategories(new Set());
        } else {
            setSelectedCategories(new Set(categories));
        }
    };

    return (
        <Card className="w-full relative">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">Monthly Spending by Category</CardTitle>
                        <CardDescription className="text-sm mt-1">
                            Comparing spending across all uploaded statements
                        </CardDescription>
                    </div>
                    <Button
                        variant={showFilters ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2 transition-all"
                    >
                        {showFilters ? (
                            <>
                                <X className="h-4 w-4" />
                                Close
                            </>
                        ) : (
                            <>
                                <SlidersHorizontal className="h-4 w-4" />
                                Filters
                            </>
                        )}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="pb-6 space-y-6">
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-5 border rounded-lg p-5 bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                                {/* Statements Pills */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold tracking-tight">Statements</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleAllMonths}
                                            className="h-7 text-xs hover:bg-background/80"
                                        >
                                            {selectedMonths.size === months.length ? 'Clear All' : 'Select All'}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {months.map((month, index) => (
                                            <motion.button
                                                key={month}
                                                onClick={() => toggleMonth(month)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`
                                                    relative px-4 py-2 rounded-full text-sm font-medium
                                                    transition-all duration-200 border-2
                                                    ${selectedMonths.has(month)
                                                        ? 'bg-background shadow-md border-primary/20'
                                                        : 'bg-background/40 border-transparent opacity-50 hover:opacity-75'
                                                    }
                                                `}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{
                                                            backgroundColor: selectedMonths.has(month)
                                                                ? COLORS[index % COLORS.length]
                                                                : 'currentColor',
                                                            opacity: selectedMonths.has(month) ? 1 : 0.3
                                                        }}
                                                    />
                                                    {month}
                                                </span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3 border-t border-border/50">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-semibold tracking-tight">Categories</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={toggleAllCategories}
                                            className="h-7 text-xs hover:bg-background/80"
                                        >
                                            {selectedCategories.size === categories.length ? 'Clear All' : 'Select All'}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                                        {categories.map((category) => (
                                            <motion.button
                                                key={category}
                                                onClick={() => toggleCategory(category)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`
                                                    px-3 py-1.5 rounded-full text-xs font-medium
                                                    transition-all duration-200 border-2
                                                    ${selectedCategories.has(category)
                                                        ? 'bg-background shadow-sm border-primary/20'
                                                        : 'bg-background/40 border-transparent opacity-50 hover:opacity-75'
                                                    }
                                                `}
                                            >
                                                {category}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
                    <BarChart
                        data={filteredData}
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
                        {months.filter(month => selectedMonths.has(month)).map((month) => {
                            const originalIndex = months.indexOf(month);
                            return (
                                <Bar
                                    key={month}
                                    name={month}
                                    dataKey={month}
                                    fill={COLORS[originalIndex % COLORS.length]}
                                    radius={[2, 2, 0, 0]}
                                />
                            );
                        })}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
