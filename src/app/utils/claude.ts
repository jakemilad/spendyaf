import Annthropic, { Anthropic } from "@anthropic-ai/sdk"

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function TestClaude() {
  
    const msg = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: "What should I search for to find the latest developments in renewable energy?"
        }
      ]
    });
    console.log(msg);
    const firstBlock = msg.content[0];
    return firstBlock.type === 'text' ? firstBlock.text : 'No text content';
}

export async function openAICategories(merchants: string[], userCategories: string[]) {
  const prompt = `Categorize merchants into these categories: ${userCategories.join(', ')}

Merchants: ${merchants.join(', ')}

Return only a JSON object mapping each merchant to one category. Examples:
{"Amazon": "Online Shopping", "Uber": "Transportation"}

Output:`;

  const response = await claude.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 200,
    messages: [
      {role: "user", content: prompt}
    ]
  });
  try {
    const content = response.content[0];
    if(!content) return {"error": "No content returned from OpenAI"};
    return content.type === 'text' ? content.text : 'No text content';
  } catch (error) {
    console.error(error);
    return {"error": "Error parsing Claude response"};
  }
}
