import OpenAI from "openai";
import { DbStatement, Transaction } from "../types/types";
import pool from "@/lib/db";

const model = "gpt-4o-mini"; // Fixed model name

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function Test(query: string) {
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: query }],
  });
  return {response: response.choices[0]?.message?.content, usage: response.usage, model: response.model};
}

export async function openAICategories(merchants: string[], userCategories: string[]) {
    const prompt = `You are an AI specialized in categorizing financial transactions with high accuracy.

Instructions:
1. Categorize each merchant into exactly one of these categories: ${userCategories.join(', ')}
2. Use exact matches for category names - no variations allowed
3. Return ONLY a valid JavaScript object/dictionary

Reference categorizations:
{
    "Amazon Purchase": "Online Shopping",
    "Prime Video": "Online Subscriptions",
    "CRAVE": "Online Subscriptions",
    "DOORDASH": "DoorDash",
    "Disney Subscription": "Online Subscriptions",
    "EVO Car Share": "Evo",
    "Whole Foods Market": "Groceries",
    "KITS": "Personal"
}

Merchants to categorize:
${merchants.join(', ')}

Response requirements:
- Format: JavaScript dictionary only (object)
- No explanations or additional text
- No markdown formatting or backticks
- Each merchant must map to a valid category`;

    console.log('🚀 Calling OpenAI with', merchants.length, 'merchants and', userCategories.length, 'categories');
    console.log('🏪 Merchants to categorize:', merchants);
    console.log('🏷️  Available categories:', userCategories);
    
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system", 
                content: "You are a precise transaction categorization system. You only output valid JavaScript objects mapping merchants to predefined categories, no backticks or markdown formatting."
            },
            {role: "user", content: prompt}
        ],
        temperature: 0.1
    });
    try {
        const content = response.choices[0]?.message?.content;
        console.log('🤖 Raw AI Response:', content);
        if(!content) {
            console.warn('⚠️  No content returned from OpenAI');
            return {"error": "No content returned from OpenAI"};
        }
        const parsed = JSON.parse(content);
        console.log('✅ Parsed AI Categories:', parsed);
        console.log('📊 Categories count:', Object.keys(parsed).length);
        return parsed;
    } catch (error) {
        console.error('❌ Error parsing OpenAI response:', error);
        console.error('🔍 Raw content that failed to parse:', response.choices[0]?.message?.content);
        return {"error": "Error parsing OpenAI response"};
    }
}

export async function openAISummary(statement: DbStatement, message: boolean) {
    const summary = statement.data.summary;
    const transactions = statement.data.transactions;
    const insights = statement.data.insights;
    const categories = statement.data.categories;
    
    const extra = `Based on previous feedback, please provide a more focused analysis, the user is requesting the summary again:
    - Be more critical of spending patterns
    - Keep insights brief and actionable
    - Highlight the most impactful areas for improvement`;

    const prompt = `You are a direct and insightful financial advisor analyzing a monthly statement.

Role: Personal Financial Advisor
Goal: Provide a clear, actionable summary of spending patterns and opportunities for improvement

Do not give the user any suggestions that you are able to provide a budgeting plan or action plan to reducing spending. This is just your job to provide insights and a summary of the spending.

Available Data:
1. Category Summary: Breakdown of spending by category with totals and largest transactions
2. Transaction List: Detailed list of individual transactions
3. Pre-calculated Insights: System-generated spending patterns
4. Category Definitions: Reference for spending classifications

Analysis Requirements:
1. Focus Areas:
   - Highlight unusual spending patterns
   - Identify potential savings opportunities
   - Compare spending across categories
   - Note any concerning trends

2. Response Format:
   - Use natural, conversational language
   - Address the user directly as "you"
   - Keep paragraphs short and focused
   - Avoid technical jargon
   - No formatting, tables, or special characters
   - 150 words or less

${message ? extra : ''}

Financial Data:
- Category Summary: ${JSON.stringify(summary, null, 2)}
- Transactions: ${JSON.stringify(transactions, null, 2)}
- Insights: ${JSON.stringify(insights, null, 2)}
- Categories: ${JSON.stringify(categories, null, 2)}

Remember: The user will see this summary alongside visual data (charts, tables, insights), so focus on insights rather than repeating numbers.`;

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: "You are a concise, direct financial advisor focused on actionable insights. Maintain a professional yet approachable tone."
            },
            {role: "user", content: prompt}
        ]
    });

    try {
        const content = response.choices[0]?.message?.content;
        if(!content) return "No content found";
        return content;
    } catch (error) {
        console.error(error);
        return "Error generating summary";
    }
}

export async function openAICategoriesFromTransactions(transactions: string[]): Promise<string[]> {
    const prompt = `
    You are an AI tasked with categorizing financial transactions based on merchant names.
    Instructions:
    1. Analyze the list of unique merchant names provided.
    2. Identify a distinct set of single-word categories that can encompass all the merchants listed.
    3. Ensure that each category name is concise and consists of only one word.
    4. Return the result as a JavaScript array of unique strings, where each string is a category name.
    5. Do not include any explanations, formatting, or additional text—only the array of unique category names.

    Unique Merchants:
    ${transactions.join(', ')}

    Response requirements:
    - Format: JavaScript array of unique strings
    - No explanations or additional text
    - No markdown formatting or backticks
    `
    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: "You are a concise, direct financial advisor focused on actionable insights. You only output valid JavaScript arrays of strings, no backticks or markdown formatting."
            },
            {role: "user", content: prompt}
        ],
        temperature: 0.1
    });
    try {
        const content = response.choices[0]?.message?.content;
        console.log('🤖 Raw AI Category Generation Response:', content);
        if(!content) {
            console.warn('⚠️  No content returned from category generation');
            return [];
        }
        const parsed = JSON.parse(content);
        console.log('✅ Generated User Categories:', parsed);
        console.log('📊 Generated categories count:', parsed.length);
        return parsed;
    } catch (error) {
        console.error('❌ Error parsing category generation response:', error);
        const content = response.choices[0]?.message?.content;
        console.error('🔍 Raw content that failed to parse:', content);
        return [];
    }
}

// Merchant category caching functions
export async function getCachedMerchantCategories(userId: string, merchants: string[]): Promise<Record<string, string>> {
    try {
        if (merchants.length === 0) return {};

        const result = await pool.query(
            'SELECT merchant, category FROM merchant_categories WHERE user_id = $1 AND merchant = ANY($2)',
            [userId, merchants]
        );

        const cached: Record<string, string> = {};
        result.rows.forEach(row => {
            cached[row.merchant] = row.category;
        });

        return cached;
    } catch (error) {
        console.error('Error fetching cached merchant categories:', error);
        return {};
    }
}

export async function cacheMerchantCategories(userId: string, merchantCategories: Record<string, string>): Promise<void> {
    try {
        const entries = Object.entries(merchantCategories);
        if (entries.length === 0) return;

        const values = entries.map((_, index) =>
            `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
        ).join(', ');

        const params: any[] = [];
        entries.forEach(([merchant, category]) => {
            params.push(userId, merchant, category);
        });

        await pool.query(
            `INSERT INTO merchant_categories (user_id, merchant, category)
             VALUES ${values}
             ON CONFLICT (user_id, merchant) DO UPDATE SET
                category = EXCLUDED.category,
                updated_at = CURRENT_TIMESTAMP`,
            params
        );
    } catch (error) {
        console.error('Error caching merchant categories:', error);
    }
}

// Enhanced openAICategories with timeout and batch processing
export async function openAICategoriesWithTimeout(merchants: string[], userCategories: string[], timeoutMs: number = 8000): Promise<Record<string, string>> {
    return Promise.race([
        openAICategories(merchants, userCategories),
        new Promise<Record<string, string>>((_, reject) =>
            setTimeout(() => reject(new Error('AI categorization timeout')), timeoutMs)
        )
    ]);
}

export default openai;
