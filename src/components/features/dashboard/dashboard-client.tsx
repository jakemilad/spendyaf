'use client'

import { useEffect, useState } from "react"
import type { CategoryBudgetMap } from "@/app/types/types"
import { DbStatement } from "@/app/types/types"
import { DashboardSidebar } from "@/components/features/dashboard/dashboard-sidebar"
import { PieChartComponent } from "@/components/charts/pie-chart"
import { SummaryTable } from "@/components/features/insights/summary-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import TransactionsChart from "@/components/charts/timeseries"
import { LoadingOverlay } from "@/components/loading/loading-overlay"
import { AiSummary } from "@/components/features/insights/ai-summary"
import { InsightsComponent } from "@/components/features/insights/insights"
import { motion } from "framer-motion"
import { fadeInUp } from "@/components/animations/animations"
import { CATEGORY_BUDGET_EVENT, normalizeCategoryBudgets } from "@/lib/category-budgets"

export function DashboardClient({
    initialStatements,
    userName,
    initialCategoryBudgets,
  }: {
    initialStatements: DbStatement[],
    userName: string,
    initialCategoryBudgets: CategoryBudgetMap
  }) {

    const [selectedStatement, setSelectedStatement] = useState<DbStatement | null>(
      initialStatements.length > 0 ? initialStatements[0] : null
    )

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudgetMap>(() =>
      normalizeCategoryBudgets(initialCategoryBudgets),
    )

    useEffect(() => {
      setCategoryBudgets(normalizeCategoryBudgets(initialCategoryBudgets))
    }, [initialCategoryBudgets])

    useEffect(() => {
      const handleBudgetEvent = (event: Event) => {
        const detail = (event as CustomEvent<CategoryBudgetMap>).detail
        if (detail) {
          setCategoryBudgets(normalizeCategoryBudgets(detail))
        }
      }

      window.addEventListener(
        CATEGORY_BUDGET_EVENT,
        handleBudgetEvent as EventListener,
      )

      return () => {
        window.removeEventListener(
          CATEGORY_BUDGET_EVENT,
          handleBudgetEvent as EventListener,
        )
      }
    }, [])

    return (
      <>
        <LoadingOverlay 
            isOpen={isLoading} 
            message="Refreshing your statement..."
        />
      <div className="flex min-h-screen">
        {initialStatements.length === 0 ? (
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
          </>
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
              <motion.div 
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2 lg:col-span-2">
                      <div
                        className="bg-card rounded-lg shadow-sm h-[1000px] overflow-y-auto">
                      {selectedStatement && (
                        <SummaryTable 
                          statement={selectedStatement}
                          categoryBudgets={categoryBudgets}
                        />
                      )}
                      </div>
                  </div>
                  <div className="col-span-1 flex flex-col gap-3">
                      <div className="bg-card rounded-lg shadow-sm h-[370px] overflow-y-auto">
                        {selectedStatement && (
                          <PieChartComponent statement={selectedStatement} />
                        )}
                      </div>
                      <div className="bg-card rounded-lg shadow-sm h-[620px] overflow-y-auto">
                        {selectedStatement && (
                          <InsightsComponent statement={selectedStatement} />
                        )}
                      </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-6">
                  {selectedStatement && (
                    <TransactionsChart statement={selectedStatement} />
                  )}
                  {selectedStatement && (
                    <AiSummary statement={selectedStatement} />
                  )}
                </div>
              </motion.div>
            </main>
          </>
        )}
      </div>
      </>
    )
  }
