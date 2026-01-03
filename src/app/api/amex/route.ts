
import { NextResponse } from "next/server";
import { uploadAndProcessStatement } from "@/app/actions";
import logger from "@/lib/logger";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const result = await uploadAndProcessStatement(formData);
        
        if (!result) {
            return NextResponse.json(
                { message: 'No result returned from upload process' },
                { status: 400 }
            );
        }

        logger.info('/amex route - Processing completed successfully!');
        logger.info(` File: ${result.fileName}`);
        logger.info(` Total Spend: $${result.totalSpend}`);
        logger.info(` Unique Merchants: ${Object.keys(result.categories).length}`);
        logger.info(` Categories Used: ${Object.values(result.categories).filter((v, i, a) => a.indexOf(v) === i).length}`);
        logger.info(` Transactions: ${result.transactions.length}`);
        logger.info(` Insights Generated: ${Object.keys(result.insights).length} types`);
        
        return NextResponse.json(
            result,
            { status: 200 }
        );
    } catch (error) {
        console.error('API error:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        
        if (errorMessage.includes('Unauthorized') || errorMessage.includes('unauthorized')) {
            return NextResponse.json(
                { message: 'Authentication required' },
                { status: 401 }
            );
        }
        
        if (errorMessage.includes('No file uploaded') || 
            errorMessage.includes('File must be a CSV') ||
            errorMessage.includes('Please provide both a file and a name')) {
            return NextResponse.json(
                { message: errorMessage },
                { status: 400 }
            );
        }
        
        if (errorMessage.includes('400') && 
            (errorMessage.includes('temperature') || 
             errorMessage.includes('invalid_request_error') ||
             errorMessage.includes('Unsupported value'))) {
            return NextResponse.json(
                { message: 'AI service configuration error - please try again later' },
                { status: 503 } 
            );
        }
        
        if (errorMessage.includes('rate_limit') || 
            errorMessage.includes('quota') ||
            errorMessage.includes('429')) {
            return NextResponse.json(
                { message: 'AI service temporarily unavailable - please try again' },
                { status: 503 } 
            );
        }
        
        return NextResponse.json(
            { 
                message: errorMessage.includes('Internal server error') 
                    ? 'Internal server error - please try again' 
                    : errorMessage 
            },
            { status: 500 }
        );
    }
}