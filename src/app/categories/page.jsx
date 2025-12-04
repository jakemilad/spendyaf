import Categories from "@/components/features/categories/categories"
import { getCategoryBudgets, getUserCategories, getUserStatements } from "../actions"

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
    const categories = await getUserCategories()
    const statements = await getUserStatements()
    const categoryBudgets = await getCategoryBudgets()
    return (
        <Categories initialCategories={categories} statements={statements} initialBudgets={categoryBudgets} />
    )
}
