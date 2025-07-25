import { getUserStatements, getUserCategories } from "../actions";
import { Upload } from "@/components/features/upload/upload";

export default async function UploadStatement() {
    const statements = await getUserStatements();
    const categories = await getUserCategories();
    return (<Upload statements={statements || []} categories={categories || []} />);
}