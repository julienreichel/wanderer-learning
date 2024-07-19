import type { DynamoDBStreamHandler } from "aws-lambda";
import { Logger } from "@aws-lambda-powertools/logger";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

import { env } from "$amplify/env/dynamoDB-ai-trigger";

const logger = new Logger({
  logLevel: "INFO",
  serviceName: "dynamodb-stream-handler",
});

export const handler: DynamoDBStreamHandler = async (event) => {
  const apiKey = env.OPENAI_API_KEY;

  /**
   * @param {object} body
   * @returns {Promise<any>}
   */
  const request = async (body: object): Promise<any> => {
    const END_POINT = "https://api.openai.com/v1/chat/completions";

    const response = await fetch(END_POINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    return await response.json();
  };

  await Promise.all(
    event.Records.map(async (record) => {
      logger.info(`Event Type: ${record.eventName} -> ${record.eventID}`);

      if (record.eventName === "INSERT") {
        const tableName = record.eventSourceARN?.split("/")[1];
        const key = record.dynamodb?.Keys?.id?.S;
        const row = record.dynamodb?.NewImage;
        logger.info(`Starting: ${key} for record ${record.eventID}`);
        const createdAt = row?.createdAt?.S;
        const now = new Date();
        // there is no point running the function if the data is older than 4 minutes, by the time we get the results, nobody is listening anymore
        if (
          !createdAt ||
          now.getTime() - new Date(createdAt).getTime() > 4 * 60 * 1000
        ) {
          logger.warn(`Old data for: ${key} -> skipping`);
          return;
        }
        console.log(key, row);
        if (!tableName || !row || !key) return;
        let payload = {
          token: row.token?.N,
          system: row.system?.S,
          prompt: row.prompt?.S,
          model: row.model?.S,
          format: row.format?.S,
        };

        const temperature = Number(env.OPENAI_TEMPERATURE) || 0.7;

        const max_tokens =
          Number(payload.token) || Number(env.OPENAI_MAX_TOKEN) || 50;

        const system = payload.system;
        const prompt = payload.prompt;
        const format = payload.format || "json";
        const model = payload.model || env.OPENAI_MODEL || "gpt-4o-mini";

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

        let data = await request(body);
        let retryCnt = 0;

        while (data.error && data.error.code === "rate_limit_exceeded") {
          retryCnt++;
          // get the recomended time to wait from the message with some margin, or 10s by default
          const retry =
            Number(
              data.error.message.match(/Please try again in ([.\d]+)s/)?.[1],
            ) || 5;
          logger.info(
            `Rate limit exceeded for ${key}, retrying in ${retry * retryCnt}s`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, retry * retryCnt * 1000),
          );
          data = await request(body);
          const time = new Date();
          if (time.getTime() - now.getTime() > 4 * 60 * 1000) {
            // we stop, this is over, we will never make it
            break;
          }
        }
        logger.info(`Finished ${key} after ${retryCnt} retries`);

        // write the result into the table
        if (data.error) {
          logger.warn(`Error for: ${key} -> ${data.error.message}`);
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
            "set content = :content, finish_reason = :finish_reason, token_usage = :token_usage, updatedAt = :updatedAt",
          ExpressionAttributeValues: {
            ":content": data.choices[0].message.content.trim(),
            ":finish_reason": data.choices[0].finish_reason,
            ":token_usage": data.usage,
            ":updatedAt": new Date().toISOString(),
          },
        };
        const command = new UpdateCommand(updateParams);
        await ddbDocClient.send(command);

        logger.info(`Success: ${key}`);
      }
    }),
  );
  logger.info(`Successfully processed ${event.Records.length} records.`);

  return {
    batchItemFailures: [],
  };
};
