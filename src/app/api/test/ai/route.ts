import { NextResponse } from "next/server";
import OpenAI from "openai";
import logger from "@/lib/logger";

const model = "gpt-5.2-2025-12-11";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
    const response = await testAIMerchantCategories(merchants, userCategories);
    return NextResponse.json(response);
}

const userCategories = ["Restaurants","Bills","Groceries","Online Subscriptions","Clothes","Personal","Entertainment","Transport","Evo","Shopping","Bills","DoorDash"]
const merchants = [
    "UBER *TRIP",
    "LYFT RIDE",
    "DOORDASH*BURGER",
    "DOORDASH*THAI",
    "STARBUCKS STORE 48291",
    "MCDONALDS #10423",
    "LOCAL PIZZA CO",
    "WHOLEFDS MKT 10234",
    "SAFEWAY #3312",
    "NOFRILLS 4587",
    "AMZN MKTPLACE PMTS",
    "APPLE.COM/BILL",
    "NETFLIX.COM",
    "SPOTIFY P0F3A",
    "GOOGLE*YOUTUBE",
    "H&M TORONTO",
    "ZARA CANADA",
    "UNIQLO TOR",
    "NIKE.COM CA",
    "WINNERS 224",
    "BELL CANADA",
    "ROGERS WIRELESS",
    "HYDRO ONE",
    "TORONTO PARKING AUTH",
    "EVO CAR SHARE",
    "EVO *TRIP FEE",
    "CINEPLEX ENTERTAINMENT",
    "STEAMGAMES.COM",
    "LCBO QUEENS QUAY",
    "SHOPPERS DRUG MART 1123"
  ];  
  
  
export async function testAIMerchantCategories(merchants: string[], userCategories: string[]) {
    if (!merchants.length || !userCategories.length) {
        logger.error('testAIMerchantCategories called without merchants or categories');
        return {};
    }
    const prompt = buildPrompt(merchants, userCategories);

    const response = await openai.chat.completions.create({
        model: model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });
    const content = await parseJSON(response);
    return content;
  }

  export async function parseJSON(response: any) {
    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);
    if (!parsed) {
        console.error('Error parsing OpenAI response for categories:', content);
        return {};
    }
    return parsed;
  }
  
  
  export function buildPrompt(
    merchants: string[],
    userCategories: string[]
  ): string {
    return `
  You are an AI assistant tasked with categorizing bank transaction merchants.
  
  Given:
  - A list of valid transaction categories
  - A list of merchant names from bank statements
  
  Your job:
  - Assign exactly ONE category to EACH merchant
  - Choose the best possible match based on common real world usage
  - Use ONLY the provided categories
  - Do NOT invent new categories
  - Do NOT explain your reasoning
  - Do NOT include any text outside the final output
  
  Output requirements:
  - Return STRICTLY a valid JSON object
  - Keys must be the merchant names exactly as provided
  - Values must be one of the provided categories
  - No comments, no markdown, no extra text
  
  Categories:
  ${JSON.stringify(userCategories, null, 2)}
  
  Merchants:
  ${JSON.stringify(merchants, null, 2)}
  
  Return ONLY a valid JSON object in this format:
  {
    "MERCHANT_NAME": "Category",
    ...
  }
  `;
  }