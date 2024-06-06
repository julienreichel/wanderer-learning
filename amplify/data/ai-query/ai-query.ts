import type { Schema } from "../resource";
import { env } from "$amplify/env/ai-query";

//const fetch = require("node-fetch");

export const handler: Schema["AIQuery"]["functionHandler"] = async (
  event,
  context,
) => {
  const apiKey = env.OPENAI_API_KEY;
  const model = env.OPENAI_MODEL || "gpt-3.5-turbo";
  const max_tokens = Number(env.OPENAI_MAX_TOKEN) || 50;
  const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

  console.log(event);
  console.log(apiKey);

  const prompt = event.arguments.prompt;

  const body = {
    messages: [{ role: "user", content: prompt }],
    model,
    max_tokens,
    temperature,
  };

  console.log(body);

  const END_POINT = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(END_POINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  console.log(data);

  if (data.error) {
    return data.error.message;
  }

  return data.choices[0].message.content.trim();
};
