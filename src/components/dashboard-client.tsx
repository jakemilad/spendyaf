'use client'

import { useState } from "react"
import { DbStatement } from "@/app/types/types"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PieChartComponent } from "@/components/pie-chart"
import { SummaryTable } from "@/components/summary-table"
export function DashboardClient({
    initialStatements, 
    userName
  }: {
    initialStatements: DbStatement[],
    userName: string
  }) {
  
    const [selectedStatement, setSelectedStatement] = useState<DbStatement | null>(
      initialStatements.length > 0 ? initialStatements[0] : null
    )
  
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <DashboardSidebar 
          statements={initialStatements}
          selectedStatement={selectedStatement}
          onStatementSelect={setSelectedStatement}
          userName={userName}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              {selectedStatement && (
                <SummaryTable statement={selectedStatement} />
              )}
            </div>
            <div className="col-span-1 bg-card rounded-lg shadow">
              {selectedStatement && (
                <PieChartComponent statement={selectedStatement} />
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }