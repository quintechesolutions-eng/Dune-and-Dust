import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";

dotenv.config();

const openrouter = new OpenRouter({
  apiKey: process.env.GEMINI_API_KEY || ""
});

async function main() {
  const response = await openrouter.chat.send({
    chatRequest: {
      model: "inclusionai/ling-2.6-flash:free",
      messages: [{ role: "user", content: "Test message" }]
    }
  });
  console.log(JSON.stringify(response, null, 2));
}

main().catch(console.error);
