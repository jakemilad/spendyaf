'use client'

import { useState, useTransition } from "react";

export function OverrideClient() {
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
            <button onClick={handleSubmit} disabled={isPending}>
                {isPending ? "Saving..." : "Apply Overrides"}
            </button>
            {message && <p>{message}</p>}
        </div>
    );
}
