'use client';

import { DbStatement } from "@/app/types/types";
import { useState } from "react";
import CompareStatements from "@/components/features/compare/compare-statements";
import AreaChartCompare from "@/components/features/compare/area-chart-compare";

export function CompareClient({ data, months, areaChartData }: { data: any, months: any, areaChartData: any }) {

    return (        
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Compare Statements</h1>
                <p className="text-muted-foreground mt-2">
                    Analyze and compare your spending patterns across different months to identify trends and insights.
                </p>
            </div>

            <div className="space-y-8">
                <div className="w-full">
                    <CompareStatements data={data} months={months} />
                </div>
                
                <div className="w-full">
                    <AreaChartCompare areaChartData={areaChartData} />
                </div>
            </div>
        </div>
    )

}