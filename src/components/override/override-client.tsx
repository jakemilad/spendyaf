'use client'

import { Override, OverrideDataTable, columns } from "@/components/override/override-table";

interface OverrideClientProps {
  merchantData: Override[];
  userCategories: string[];
}

export function OverrideClient({ merchantData, userCategories }: OverrideClientProps) {
    return (
        <div>
            <OverrideDataTable data={merchantData} columns={columns} userCategories={userCategories} />
        </div>
    );
}
