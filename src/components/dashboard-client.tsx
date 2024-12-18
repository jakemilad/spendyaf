'use client'

import { useState } from "react"
import { DbStatement } from "@/app/types/types"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { PieChartComponent } from "@/components/pie-chart"
import { SummaryTable } from "@/components/summary-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import TransactionsChart from "@/components/timeseries"
import { LoadingOverlay } from "./loading-overlay"
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

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    return (
      <>
        <LoadingOverlay 
            isOpen={isLoading} 
            message="Refreshing your statement..."
        />
      <div className="flex min-h-screen">
        {initialStatements.length === 0 ? (
          <div className="flex-1 flex-col items-center justify-center p-20 mt-10">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Welcome, {userName}!</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground">No statements uploaded yet</p>
                <p className="text-sm text-muted-foreground">Upload your first bank statement to get started</p>
              </div>
              <Button asChild variant="default">
                <Link href="/upload-statement">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Statement
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <aside className={cn(
              "border-r border-border/40 transition-all duration-300",
              isSidebarCollapsed ? "w-12" : "w-64"
            )}>
              <DashboardSidebar 
                statements={initialStatements}
                selectedStatement={selectedStatement}
                onStatementSelect={setSelectedStatement}
                userName={userName}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                onLoadingChange={setIsLoading}
              />
            </aside>
            <main className="flex-1 overflow-y-auto bg-background/50">
              <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <div className="bg-card rounded-lg shadow-sm min-h-[400px] max-h-[800px] overflow-y-auto">
                      {selectedStatement && (
                        <SummaryTable statement={selectedStatement} />
                      )}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="bg-card rounded-lg shadow-sm min-h-[400px] max-h-[800px] overflow-y-auto">
                      {selectedStatement && (
                        <PieChartComponent statement={selectedStatement} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                    {selectedStatement && (
                      <TransactionsChart statement={selectedStatement} />
                    )}
                  </div>
              </div>
            </main>
          </>
        )}
      </div>
      </>
    )
  }