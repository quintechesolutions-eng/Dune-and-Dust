import { OpenRouter } from "@openrouter/sdk";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const openrouter = new OpenRouter({
  apiKey: process.env.GEMINI_API_KEY || "<OPENROUTER_API_KEY>"
});

async function main() {
  console.log("Sending request to inclusionai/ling-2.6-flash:free...");
  const stream = await openrouter.chat.send({
    chatRequest: {
      model: "inclusionai/ling-2.6-flash:free",
      messages: [
        {
          "role": "user",
          "content": "What is the meaning of life? Please keep it very brief."
        }
      ],
      stream: true
    }
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      process.stdout.write(content);
    }
  }
  console.log(); // Add a newline at the end
}

main().catch(console.error);
