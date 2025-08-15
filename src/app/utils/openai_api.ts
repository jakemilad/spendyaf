import OpenAI from "openai";
import { DbStatement, Transaction } from "../types/types";

const model = "gpt-5-mini";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function Test(query: string) {
  const response = await openai.responses.create({
    model: model,
    input: [{ role: "user", content: query }],
  });
  return {response: response.output_text, usage: response.usage, model: response.model};
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

    const response = await openai.responses.create({
        model: model,
        input: [
            {
                role: "system", 
                content: "You are a precise transaction categorization system. You only output valid JavaScript objects mapping merchants to predefined categories, no backticks or markdown formatting."
            },
            {role: "user", content: prompt}
        ]
    });
    try {
        const content = response.output_text;
        console.log(content);
        if(!content) return {"error": "No content returned from OpenAI"};
        return JSON.parse(content);
    } catch (error) {
        console.error(error);
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

    const response = await openai.responses.create({
        model: model,
        input: [
            {
                role: "system",
                content: "You are a concise, direct financial advisor focused on actionable insights. Maintain a professional yet approachable tone."
            },
            {role: "user", content: prompt}
        ]
    });

    try {
        const content = response.output_text;
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
    const response = await openai.responses.create({
        model: model,
        input: [
            {
                role: "system",
                content: "You are a concise, direct financial advisor focused on actionable insights. You only output valid JavaScript arrays of strings, no backticks or markdown formatting."
            },
            {role: "user", content: prompt}
        ]
    });
    try {
        const content = response.output_text;
        if(!content) return [];
        return JSON.parse(content);
    } catch (error) {
        console.error(error);
        return [];
    }
}

export default openai;
