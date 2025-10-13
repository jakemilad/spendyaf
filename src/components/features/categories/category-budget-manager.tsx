"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { CategoryBudgetMap } from "@/app/types/types"
import { CATEGORY_BUDGET_EVENT, emitCategoryBudgetUpdate, normalizeCategoryBudgets } from "@/lib/category-budgets"
import { cn } from "@/lib/utils"
import { saveCategoryBudgets as persistCategoryBudgets } from "@/app/actions"

interface CategoryBudgetManagerProps {
  categories: string[]
  initialBudgets: CategoryBudgetMap
}

type BudgetInputMap = Record<string, string>

const formatBudget = (value: number) =>
  `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export function CategoryBudgetManager({ categories, initialBudgets }: CategoryBudgetManagerProps) {
  const [budgets, setBudgets] = useState<CategoryBudgetMap>(() =>
    normalizeCategoryBudgets(initialBudgets),
  )
  const [inputs, setInputs] = useState<BudgetInputMap>({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isDirty) {
      setBudgets(normalizeCategoryBudgets(initialBudgets))
    }
  }, [initialBudgets, isDirty])

  useEffect(() => {
    const handleBudgetEvent = (event: Event) => {
      const detail = (event as CustomEvent<CategoryBudgetMap>).detail
      if (detail) {
        setBudgets(normalizeCategoryBudgets(detail))
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

  useEffect(() => {
    setInputs((prev) => {
      const next: BudgetInputMap = {}
      categories.forEach((category) => {
        const previousValue = prev[category]
        if (isDirty && previousValue !== undefined) {
          next[category] = previousValue
        } else {
          const storedValue = budgets[category]
          next[category] =
            storedValue !== undefined ? storedValue.toString() : ""
        }
      })
      return next
    })
  }, [categories, budgets, isDirty])

  const handleInputChange = (category: string, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [category]: value,
    }))
    setIsDirty(true)
  }

  const handleClear = (category: string) => {
    setInputs((prev) => ({
      ...prev,
      [category]: "",
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (categories.length === 0) {
      toast.info("Add categories first to set budgets.")
      return
    }

    const invalidCategories: string[] = []
    const sanitized: CategoryBudgetMap = categories.reduce(
      (acc, category) => {
        const rawValue = inputs[category]?.trim()
        if (!rawValue) {
          return acc
        }
        const sanitizedValue = rawValue.replace(/,/g, "")
        const parsed = Number.parseFloat(sanitizedValue)
        if (Number.isNaN(parsed) || parsed <= 0) {
          invalidCategories.push(category)
          return acc
        }

        const rounded = Math.round(parsed * 100) / 100
        acc[category] = rounded
        return acc
      },
      {} as CategoryBudgetMap,
    )

    if (invalidCategories.length > 0) {
      toast.error(
        `Enter a positive budget for: ${invalidCategories.join(", ")}`,
      )
      return
    }

    if (!isDirty) {
      toast.info("No budget changes to save.")
      return
    }

    try {
      setIsSaving(true)
      const normalized = normalizeCategoryBudgets(sanitized)
      const updated = await persistCategoryBudgets(normalized)

      if (!updated) {
        throw new Error("Failed to persist budgets")
      }

      setIsDirty(false)
      setBudgets(updated)
      emitCategoryBudgetUpdate(updated)
      toast.success("Budgets updated.")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update budgets.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Category Budgets</CardTitle>
        <CardDescription>
          Set a monthly target for each category to track spending progress on
          your dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories available yet. Upload a statement or add categories to
            start budgeting.
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const currentBudget = budgets[category]
              const hasExistingBudget = typeof currentBudget === "number"
              return (
                <div
                  key={category}
                  className="flex flex-col gap-2 rounded-lg border border-border/40 bg-muted/30 p-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{category}</p>
                    {hasExistingBudget ? (
                      <p className="text-xs text-muted-foreground">
                        Current budget: {formatBudget(currentBudget)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        Enter a monthly budget target.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      inputMode="decimal"
                      type="number"
                      min="0"
                      step="0.01"
                      value={inputs[category] ?? ""}
                      onChange={(event) =>
                        handleInputChange(category, event.target.value)
                      }
                      placeholder="0.00"
                      className="w-full sm:w-32"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleClear(category)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || categories.length === 0 || isSaving}
            className={cn({ "cursor-not-allowed opacity-70": !isDirty || isSaving })}
          >
            {isSaving ? "Saving..." : "Save Budgets"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
