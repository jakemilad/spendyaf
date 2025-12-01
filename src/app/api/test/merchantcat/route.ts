import { getAllMerchantCategories } from "@/app/actions";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const searchTerm = searchParams.get('search');
        const limitParam = searchParams.get('limit');
        const offsetParam = searchParams.get('offset');

        const categories = await getAllMerchantCategories({
            searchTerm,
            limit: limitParam ? Number(limitParam) : undefined,
            offset: offsetParam ? Number(offsetParam) : undefined,
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error in merchant categories API route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
