import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { env } from "$amplify/env/ai-query";

//const fetch = require("node-fetch");

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("event", event);

  const payload = JSON.parse(event.body || "{}");

  const apiKey = env.OPENAI_API_KEY;
  const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

  console.log(event);

  const max_tokens = payload.token || Number(env.OPENAI_MAX_TOKEN) || 50;

  const system = payload.system;
  const prompt = payload.prompt;
  const format = payload.format || "json";
  const model = payload.model || env.OPENAI_MODEL || "gpt-3.5-turbo";

  let messages;
  if (payload.messages) {
    messages = payload.messages;
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

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify(data),
  };
};
