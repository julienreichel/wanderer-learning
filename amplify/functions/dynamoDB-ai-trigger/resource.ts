import { defineFunction, secret } from "@aws-amplify/backend";

export const dynamoDBAITrigger = defineFunction({
  name: "dynamoDB-ai-trigger",
  timeoutSeconds: 120,
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
    OPENAI_MAX_TOKEN: process.env.OPENAI_MAX_TOKEN || "500",
    OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE || "0.7",
  },
});
