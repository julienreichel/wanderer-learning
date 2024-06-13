import { defineFunction, secret } from "@aws-amplify/backend";

export const AIQueryRest = defineFunction({
  name: "ai-query-rest",
  timeoutSeconds: 30, // more than 30s is useless, because AppSync has a hard 30s timeout
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    OPENAI_MAX_TOKEN: process.env.OPENAI_MAX_TOKEN || "50",
    OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE || "0.7",
  },
});
