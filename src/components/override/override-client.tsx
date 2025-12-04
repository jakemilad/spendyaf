'use client'

import { useState, useTransition } from "react";
import { Override, OverrideDataTable, columns } from "@/components/override/override-table";

export function OverrideClient({merchantData}: {merchantData: Override[]}) {
    const [tableData, setTableData] = useState<Override[]>(merchantData);

    return (
        <div>
            <OverrideDataTable data={tableData} columns={columns}/>
        </div>
    );
}
