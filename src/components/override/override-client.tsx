'use client'

import { useState, useTransition } from "react";
import { Override, OverrideDataTable, columns } from "@/components/override/override-table";

export function OverrideClient({merchantData}: {merchantData: Override[]}) {
    const [tableData, setTableData] = useState<Override[]>(merchantData);
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [message, setMessage] = useState<string>("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(async () => {
            setMessage("");
            try {
                const res = await fetch("/api/overrides", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ overrides }),
                });

                const data = await res.json();
                if (!res.ok || !data?.success) {
                    throw new Error(data?.message || "Failed to apply overrides");
                }

                setMessage(`Applied ${data.overridesApplied?.length || 0} overrides.`);
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Unexpected error";
                setMessage(msg);
            }
        });
    };

    return (
        <div>
            <OverrideDataTable data={tableData} columns={columns}/>
            <button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : "Apply Overrides"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}
