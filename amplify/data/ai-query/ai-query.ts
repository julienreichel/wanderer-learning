import { Schema } from "../resource";
import { env } from "$amplify/env/ai-query";

//const fetch = require("node-fetch");

export const handler: Schema["AIQuery"]["functionHandler"] = async (
  event,
  context,
) => {
  const apiKey = env.OPENAI_API_KEY;
  const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

  console.log(event);

  const max_tokens =
    event.arguments.token || Number(env.OPENAI_MAX_TOKEN) || 50;

  const system = event.arguments.system;
  const prompt = event.arguments.prompt;
  const format = event.arguments.format || "json";
  const model = event.arguments.model || env.OPENAI_MODEL || "gpt-3.5-turbo";

  let messages;
  if (event.arguments.messages) {
    messages = event.arguments.messages;
  } else {
    messages = [];
    if (system) {
      messages.push({ role: "system", content: system });
    }
    if (prompt) {
      messages.push({ role: "user", content: prompt });
    }
  }

  let response_format;
  if (format === "json") {
    response_format = { type: "json_object" };
  }
  const body = {
    messages,
    model,
    max_tokens,
    temperature,
    response_format,
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
  return JSON.stringify(data);
};
