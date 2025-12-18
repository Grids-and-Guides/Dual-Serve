import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';
import { getUserRequestSchema } from './get-user.dto';

const getUserTrigger = new Trigger({
    type: "http",
    endpoint: "users/:id",
    method: "GET",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "",
    requestSchema:getUserRequestSchema
  });
  
export const getUserFunction = new FunctionConfig({
    name: "get-user-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/apis/examples/users/get/get-user.ts"),
    output: path.resolve(process.cwd(), "dist/src/apis/examples/users/get/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [getUserTrigger]
  });