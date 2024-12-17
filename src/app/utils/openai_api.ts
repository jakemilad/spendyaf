import { CATEGORIES } from "@/app/utils/dicts";
import OpenAI from "openai";
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
    const prompt = `You are categorizing a list of merchants into the following categories:
${CATEGORIES.join(', ')}.

Here are examples of correct categorizations:
'Amazon Purchase' -> 'Online Shopping'
'Prime Video' -> 'Online Subscriptions'
'CRAVE' -> 'Online Subscriptions'
'DOORDASH' -> 'DoorDash'
'Disney Subscription' -> 'Online Subscriptions'
'EVO Car Share' -> 'Evo'
'Whole Foods Market' -> 'Groceries'
'KITS' -> 'Personal'

Categorize each of the following merchants into one of these categories.
${merchants.join(', ')}

Return the result strictly as a JavaScript dictionary where each key is a merchant name and the value is the category. Do not return a string, list, or any other data type, only a JavaScript dictionary.
Do not include any other text in the response, only return the JavaScript Dictionary and do not include \`\`\` backticks.`;
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {role: "system", content: "You are a helpful assistant that will help cateogirze my transactions."},
            {role: "user", content: prompt}
        ]
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

export default openai;
