import OpenAI from "openai";
import { CategorySummary, DbStatement, Transaction } from "../types/types";
import pool from "@/lib/db";

const model = "gpt-5-mini";
const MAX_SAMPLE_TRANSACTIONS = 50;
const MAX_SAMPLE_SUMMARY_ROWS = 12;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function normalizeJSONString(content: string | null | undefined) {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const candidate = trimmed.slice(start, end + 1);
      try {
        return JSON.parse(candidate);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildSampleMapping(merchants: string[], userCategories: string[]) {
  if (!merchants.length || !userCategories.length) {
    return {};
  }

  const sample: Record<string, string> = {};
  const sliceLength = Math.min(4, merchants.length);
  for (let i = 0; i < sliceLength; i++) {
    const merchant = merchants[i];
    const category = userCategories[i % userCategories.length];
    sample[merchant] = category;
  }
  return sample;
}

function trimTransactions<T>(items: T[]): T[] {
  if (items.length <= MAX_SAMPLE_TRANSACTIONS) return items;
  return items.slice(0, MAX_SAMPLE_TRANSACTIONS);
}

function trimSummary(summary: CategorySummary[]): CategorySummary[] {
  if (summary.length <= MAX_SAMPLE_SUMMARY_ROWS) return summary;
  return summary.slice(0, MAX_SAMPLE_SUMMARY_ROWS);
}

export async function Test(query: string) {
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: query }],
  });
  return {response: response.choices[0]?.message?.content, usage: response.usage, model: response.model};
}

export async function openAICategories(merchants: string[], userCategories: string[]) {
    if (!merchants.length || !userCategories.length) {
        console.warn('openAICategories called without merchants or categories');
        return {};
    }

    const sampleMapping = buildSampleMapping(merchants, userCategories);
    const prompt = `You map merchant names to spending categories.

Rules:
- Use ONLY these categories verbatim: ${userCategories.join(', ')}
- Every merchant must map to exactly one category from the list above
- Output must be a JSON object where each key is a merchant and each value is the chosen category

Example format (for illustration only, adapt to the actual merchants):
${JSON.stringify(sampleMapping, null, 2)}

Merchants to categorize:
${merchants.join(', ')}

Return only the JSON object. No narration or markdown.`;

    console.log('Calling OpenAI with', merchants.length, 'merchants and', userCategories.length, 'categories');
    console.log('Merchants to categorize:', merchants);
    console.log('Available categories:', userCategories);

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: "You are a precise transaction categorization system. You always return valid JSON objects mapping merchants to predefined categories."
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
    });
    const content = response.choices[0]?.message?.content;
    const parsed = normalizeJSONString(content);

    if (!parsed) {
        console.error('Error parsing OpenAI response for categories:', content);
        return {};
    }

    console.log('Parsed AI Categories:', parsed);
    console.log('Categories count:', Object.keys(parsed).length);
    return parsed;
}

export async function openAISummary(statement: DbStatement, message: boolean) {
    const summary = trimSummary(statement.data.summary);
    const transactions = trimTransactions(statement.data.transactions);
    const insights = statement.data.insights;
    const categories = statement.data.categories;
    const totalSummaryRows = statement.data.summary.length;
    const totalTransactions = statement.data.transactions.length;
    
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
- Category Summary (${totalSummaryRows > summary.length ? `showing ${summary.length} of ${totalSummaryRows}` : `${summary.length}`} categories): ${JSON.stringify(summary, null, 2)}
- Transactions (${totalTransactions > transactions.length ? `showing ${transactions.length} of ${totalTransactions}` : `${transactions.length}`} records): ${JSON.stringify(transactions, null, 2)}
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
    if (!transactions.length) return [];

    const prompt = `Generate concise, single-word spending category names that cover all provided merchants.

Rules:
- Output a JSON object with a single key "categories" whose value is an array of unique strings
- Each string must be a single descriptive word (e.g., "Groceries", "Travel")
- Limit the list to the smallest set that reasonably covers all merchants
- Do not include explanations or additional text

Merchants:
${transactions.join(', ')}

Return only the JSON object.`;

    const response = await openai.chat.completions.create({
        model: model,
        messages: [
            {
                role: "system",
                content: "You return only JSON objects of the form { \"categories\": string[] }."
            },
            { role: "user", content: prompt }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
    });

    const content = response.choices[0]?.message?.content;
    const parsed = normalizeJSONString(content);

    if (!parsed || !Array.isArray(parsed.categories)) {
        console.error('Error parsing category generation response:', content);
        return [];
    }

    const uniqueCategories = [...new Set(parsed.categories)]
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0);

    console.log('Generated User Categories:', uniqueCategories);
    console.log('Generated categories count:', uniqueCategories.length);
    return uniqueCategories;
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

// openAICategories with timeout and batch processing
export async function openAICategoriesWithTimeout(merchants: string[], userCategories: string[], timeoutMs: number = 8000): Promise<Record<string, string>> {
    return Promise.race([
        openAICategories(merchants, userCategories),
        new Promise<Record<string, string>>((_, reject) =>
            setTimeout(() => reject(new Error('AI categorization timeout')), timeoutMs)
        )
    ]);
}

export default openai;
