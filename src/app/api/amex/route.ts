
import { NextResponse } from "next/server";
import { uploadAndProcessStatement } from "@/app/actions";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const result = await uploadAndProcessStatement(formData);
        
        if (!result.success) {
            return NextResponse.json(
                { message: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json(
            result.data,
            { status: 200 }
        );
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
// export async function POST(req: Request) {
//     try {
//         const session = await getServerSession(authOptions) as Session;

//         if (!session?.user?.email) {
//             console.error('Unauthorized access attempt');
//             return NextResponse.json(
//                 { message: 'Please sign in to upload files' },
//                 { status: 401 }
//             );
//         }

//         const formData = await req.formData();
//         const file = formData.get('file') as File;
//         const fileName = formData.get('fileName') as string;


//         if(!file) {
//             return NextResponse.json(
//                 {message: 'no file uploaded'},
//                 {status: 400}
//             );
//         }
//         if (!file.name.endsWith(".csv")) {
//             return NextResponse.json(
//                 { message: "file is not a csv" },
//                 { status: 400 }
//             );
//         }

//         const buffer = Buffer.from(await file.arrayBuffer());
//         const transactions: Transaction[] = await processCSV(buffer);
//         console.log('got transactions', transactions);
//         const uniqueMerchants: string[] = [... new Set(transactions.map(t => t.Merchant))];
//         console.log('got unique merchants', uniqueMerchants);
//         const categories = await openAICategories(uniqueMerchants);
//         console.log('got categories', categories);
//         const summary = summarizeSpendByCategory(transactions, categories);
//         console.log('got summary', summary);
//         const response = {summary, categories, transactions, fileName};
//         console.log('got response', response);
//         await pool.query(
//             'INSERT INTO transaction_records (user_id, data, file_name) VALUES ($1, $2, $3)', 
//             [session?.user?.email, JSON.stringify(response), fileName]);
//         console.log('inserted into db');
//         return NextResponse.json({ summary, categories, transactions, status: 200 });
//     } catch (error) {
//         console.error('error', error);
//         return NextResponse.json({ message: error }, { status: 500 });
//     }
// }
