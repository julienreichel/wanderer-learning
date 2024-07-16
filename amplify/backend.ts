import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";

import { Stack } from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Effect, Policy, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { AIQueryRest } from "./functions/ai-query-rest/resource";

import { EventSourceMapping, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { dynamoDBAITrigger } from "./functions/dynamoDB-ai-trigger/resource";

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  storage,
  data,
  AIQueryRest,
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

// create a new HTTP Lambda integration
const httpLambdaIntegration = new HttpLambdaIntegration(
  "LambdaIntegration",
  backend.AIQueryRest.resources.lambda,
);

// create a new HTTP API with IAM as default authorizer
const httpApi = new HttpApi(apiStack, "HttpApi", {
  apiName: "aiHttpApi",
  corsPreflight: {
    allowMethods: [CorsHttpMethod.POST],
    // Restrict this to domains you trust
    allowOrigins: ["*"],
    // Specify only the headers you need to allow
    allowHeaders: ["*"],
  },
  createDefaultStage: true,
});

// add routes to the API with a IAM authorizer and different methods
httpApi.addRoutes({
  path: "/ai-query",
  methods: [HttpMethod.POST],
  integration: httpLambdaIntegration,
  authorizer: userPoolAuthorizer,
});

// create a new IAM policy to allow Invoke access to the API
const apiPolicy = new Policy(apiStack, "ApiPolicy", {
  statements: [
    new PolicyStatement({
      actions: ["execute-api:Invoke"],
      resources: [`${httpApi.arnForExecuteApi("*", "/ai-query")}`],
    }),
  ],
});

// attach the policy to the authenticated and unauthenticated IAM roles
backend.auth.resources.authenticatedUserIamRole.attachInlinePolicy(apiPolicy);
backend.auth.resources.unauthenticatedUserIamRole.attachInlinePolicy(apiPolicy);

// add outputs to the configuration file
backend.addOutput({
  custom: {
    API: {
      [httpApi.httpApiName || "ai"]: {
        endpoint: httpApi.url,
        region: Stack.of(httpApi).region,
        apiName: httpApi.httpApiName,
      },
    },
  },
});
