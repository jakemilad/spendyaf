import { CATEGORIES } from "@/app/utils/dicts";
import OpenAI from "openai";
import { DbStatement } from "../types/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function Test(query: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: query }],
  });
  return response.choices[0].message.content;
}

export async function openAICategories(merchants: string[]) {
    const prompt = `You are an AI specialized in categorizing financial transactions with high accuracy.

Instructions:
1. Categorize each merchant into exactly one of these categories: ${CATEGORIES.join(', ')}
2. Use exact matches for category names - no variations allowed
3. Return ONLY a valid JavaScript object/dictionary
4. When in doubt, use the 'Other' category rather than guessing

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

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system", 
                content: "You are a precise transaction categorization system. You only output valid JavaScript objects mapping merchants to predefined categories."
            },
            {role: "user", content: prompt}
        ],
        temperature: 0.1 
    });
    try {
        const content = response.choices[0].message.content;
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

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "You are a concise, direct financial advisor focused on actionable insights. Maintain a professional yet approachable tone."
            },
            {role: "user", content: prompt}
        ],
        temperature: 0.7  // Allow for some creativity in analysis while maintaining consistency
    });

    try {
        const content = response.choices[0].message.content;
        if(!content) return "No content found";
        return content;
    } catch (error) {
        console.error(error);
        return "Error generating summary";
    }
}

export default openai;
