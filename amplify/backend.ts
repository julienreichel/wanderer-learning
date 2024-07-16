import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

import { Stack } from "aws-cdk-lib";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";

import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { dynamoDBAITrigger } from "./functions/dynamoDB-ai-trigger/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  storage,
  data,
  dynamoDBAITrigger,
});

const AIRequestTable = backend.data.resources.tables["AIRequest"];

const policy = new Policy(
  Stack.of(AIRequestTable),
  "DynamoDBTriggerPolicyForLambda",
  {
    statements: [
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:DescribeStream",
          "dynamodb:GetRecords",
          "dynamodb:GetShardIterator",
          "dynamodb:ListStreams",
          "dynamodb:UpdateItem",
        ],
        resources: ["*"],
      }),
    ],
  },
);
backend.dynamoDBAITrigger.resources.lambda.role?.attachInlinePolicy(policy);

const mapping = new EventSourceMapping(
  Stack.of(AIRequestTable),
  "DynamoDBTriggerEvent",
  {
    target: backend.dynamoDBAITrigger.resources.lambda,
    eventSourceArn: AIRequestTable.tableStreamArn,
    startingPosition: StartingPosition.LATEST,
  },
);
mapping.node.addDependency(policy);

backend.data.resources.cfnResources.amplifyDynamoDbTables[
  "AIRequest"
].timeToLiveAttribute = {
  attributeName: "ttl",
  enabled: true,
};

const { cfnIdentityPool, cfnUserPool } = backend.auth.resources.cfnResources;
cfnIdentityPool.allowUnauthenticatedIdentities = false;

// modify cfnUserPool
cfnUserPool.autoVerifiedAttributes = ["email"];
cfnUserPool.userAttributeUpdateSettings = {
  attributesRequireVerificationBeforeUpdate: ["email"],
};

// create a new API stack
const apiStack = backend.createStack("api-stack");

// create a User Pool authorizer
const userPoolAuthorizer = new HttpUserPoolAuthorizer(
  "userPoolAuth",
  backend.auth.resources.userPool,
  {
    userPoolClients: [backend.auth.resources.userPoolClient],
  },
);

