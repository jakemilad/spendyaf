
import Categories from "@/components/categories"
import { getUserCategories, getUserStatements } from "../actions"

export default async function CategoriesPage() {
    const categories = await getUserCategories()
    const statements = await getUserStatements()
    return (
        <Categories initialCategories={categories} statements={statements} />
    )
}