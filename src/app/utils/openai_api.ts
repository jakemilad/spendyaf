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

export async function openAISummary(statement: DbStatement, message: boolean) {
  const summary = statement.data.summary;
  const tranascations = statement.data.transactions
  const insights = statement.data.insights
  const categories = statement.data.categories
  
  let extra: string = `
  You have already tried to summarize this statement and the user was not happy with it, be more critical and concise.
  Let's ensure we can produce a better summary for the user.
  `

  const prompt = `You are an adept financial analyst and advisor. You make precise, clear and concise observations and summaries of your clients financial information. 
  Your task is to assess a summary of transactions broken down by categories, a list of transactions, insights and categories and return a comprehensive summary of your clients
  spending for the statement. 

  ${message ? extra : ''}
  
  Here is the financial data, it is organized as JSON objects.

  Summary of spending by category, includes information on all transactions for that category, total spend and the biggest transaction: ${JSON.stringify(summary, null, 2)}
  
  Transactions organized by date, amount and merchant: ${JSON.stringify(tranascations, null, 2)} 
  
  Insights, pre calculated insights on the user's spending: ${JSON.stringify(insights, null, 2)}

  Categories, this is more of a nice to have for your own analysis, this does not have to be summarized necessarily, but can be used to train and understand 
  what this person's categories are for their spending: ${JSON.stringify(categories, null, 2)}

  Suggest potential areas of savings for the user, this is a nice to have, but not necessary, but its more about observations and insights.

  The summary you output will be displayed to the user alongside a dashboard that includes a table of their summary, a timeseries of their transactions, pie chart of spending
  as well as a list of the insights. Only return a summary as words (as a string), dont draw any charts or create tables or have any special styling
  This includes trying to put astrix in the response to bold it just plain text. Refer to the client as "you", do not say the client.
  This will only be a worded summary.
  `;
  
  const response = await openai.chat.completions.create({
    model:"gpt-4o",
    messages: [
      {role: "system", content: "You are a helpful financial advisor that will help summarize the user's transactions according to the given data."},
      {role: "user", content: prompt}
    ]
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
