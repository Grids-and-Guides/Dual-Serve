import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const updateUserTrigger = new Trigger({
    type: "http",
    endpoint: "users/:id",
    method: "PUT",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const updateUserFunction = new FunctionConfig({
    name: "update-user-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/apis/examples/users/update/update-user.ts"),
    output: path.resolve(process.cwd(), "dist/src/apis/examples/users/update/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [updateUserTrigger]
  });