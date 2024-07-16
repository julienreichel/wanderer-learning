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
  await Promise.all(
    event.Records.map(async (record) => {
      logger.info(`Event Type: ${record.eventName} -> ${record.eventID}`);

      if (record.eventName === "INSERT") {
        const tableName = record.eventSourceARN?.split("/")[1];
        const key = record.dynamodb?.Keys?.id?.S;
        const row = record.dynamodb?.NewImage;
        console.log(key, row);
        if (!tableName || !row || !key) return;
        let payload = {
          token: row.token?.N,
          system: row.system?.S,
          prompt: row.prompt?.S,
          model: row.model?.S,
          format: row.format?.S,
        };

        const apiKey = env.OPENAI_API_KEY;
        const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

        const max_tokens =
          Number(payload.token) || Number(env.OPENAI_MAX_TOKEN) || 50;

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

        console.log(key, body);
        const END_POINT = "https://api.openai.com/v1/chat/completions";

        const response = await fetch(END_POINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        });

        let data = await response.json();
        console.log(key, data);

        // write the result into the table
        if (data.error) {
          data.choices = [
            {
              message: { content: data.error.message },
              finish_reason: data.error.code,
            },
          ];
          data.usage = {};
        }
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
        const command = new UpdateCommand(updateParams);
        await ddbDocClient.send(command);

        console.log(key, "successfully updated");
      }
    }),
  );
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};
