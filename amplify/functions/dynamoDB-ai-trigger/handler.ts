import type { DynamoDBStreamHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

import { env } from "$amplify/env/ai-query";

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

export const handler: DynamoDBStreamHandler = async (event) => {
  console.log("event", event);
  for (const record of event.Records) {
    logger.info(`Processing record: ${record.eventID}`);
    logger.info(`Event Type: ${record.eventName}`);

    if (record.eventName === "INSERT") {
      console.log(record.dynamodb);
      const tableName = record.eventSourceARN?.split("/")[1];
      const key = record.dynamodb?.Keys?.id?.S;
      const row = record.dynamodb?.NewImage;
      if (!tableName || !row || !key) continue;
      let payload = {
        token: row.token?.S,
        system: row.system?.S,
        prompt: row.prompt?.S,
        model: row.model?.S,
        format: row.format?.S,
      };
      payload.token = record.dynamodb?.NewImage?.token?.S;

      const apiKey = env.OPENAI_API_KEY;
      const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

      console.log(event);

      const max_tokens = payload.token || Number(env.OPENAI_MAX_TOKEN) || 50;

      const system = payload.system;
      const prompt = payload.prompt;
      const format = payload.format || "json";
      const model = payload.model || env.OPENAI_MODEL || "gpt-3.5-turbo";

      let messages = [];
      if (system) {
        messages.push({ role: "system", content: system });
      }
      if (prompt) {
        messages.push({ role: "user", content: prompt });
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
      logger.info("data", data);

      // write the result into the table

      const updateParams = {
        TableName: tableName,
        Key: { id: key },
        UpdateExpression:
          "set content = :content, finish_reason = :finish_reason, token_usage = :token_usage",
        ExpressionAttributeValues: {
          ":content": data.choices[0].message.content.trim(),
          ":finish_reason": data.choices[0].finish_reason,
          ":token_usage": data.usage,
        },
      };
      logger.info("params", updateParams);
      const command = new UpdateCommand(updateParams);
      await ddbDocClient.send(command);
    }
  }
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};
