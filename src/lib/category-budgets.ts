import type { CategoryBudgetMap } from "@/app/types/types"

export const CATEGORY_BUDGET_EVENT = "category-budget:update"

export function emitCategoryBudgetUpdate(budgets: CategoryBudgetMap) {
  if (typeof window === "undefined") return
  window.dispatchEvent(
    new CustomEvent(CATEGORY_BUDGET_EVENT, {
      detail: budgets,
    }),
  )
}

export function normalizeCategoryBudgets(
  input: Record<string, unknown> | null | undefined,
): CategoryBudgetMap {
  if (!input) return {}

  return Object.entries(input).reduce<CategoryBudgetMap>(
    (acc, [category, value]) => {
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        const rounded = Math.round(value * 100) / 100
        acc[category] = rounded
      } else if (typeof value === "string") {
        const parsed = Number.parseFloat(value)
        if (Number.isFinite(parsed) && parsed > 0) {
          const rounded = Math.round(parsed * 100) / 100
          acc[category] = rounded
        }
      }
      return acc
    },
    {},
  )
}
