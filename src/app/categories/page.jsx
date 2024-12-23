
import Categories from "@/components/categories"
import { getUserCategories } from "../actions"

export default async function CategoriesPage() {
    const categories = await getUserCategories()
    return (
        <Categories initialCategories={categories} />
    )
}