'use client';

import { DbStatement } from "@/app/types/types";
import { useState } from "react";
import CompareStatements from "@/components/compare-statements";
import AreaChartCompare from "@/components/area-chart-compare";

export function CompareClient({ data, months, areaChartData }: { data: any, months: any, areaChartData: any }) {

    return (        
        <div>
            <CompareStatements data={data} months={months} />
            <AreaChartCompare areaChartData={areaChartData} />
        </div>
    )

}