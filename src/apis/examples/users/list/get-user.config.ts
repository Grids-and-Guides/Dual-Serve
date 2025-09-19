import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const usersTrigger = new Trigger({
    type: "http",
    endpoint: "users",
    method: "GET",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const usersListFunction = new FunctionConfig({
    name: "user-list-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/apis/examples/users/list/index.ts"),
    output: path.resolve(process.cwd(), "dist/src/apis/examples/users/list/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [usersTrigger]
  });