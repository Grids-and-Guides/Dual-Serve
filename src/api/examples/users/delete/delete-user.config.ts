import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';
import { deleteUserRequestSchema } from './delete-user.dto';

const deleteUserTrigger = new Trigger({
    type: "http",
    endpoint: "users/:id",
    method: "DELETE",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth",
    requestSchema:deleteUserRequestSchema
  });
  
export const deleteUserFunction = new FunctionConfig({
    name: "delete-user-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/api/examples/users/delete/delete-user.ts"),
    output: path.resolve(process.cwd(), "dist/src/api/examples/users/delete/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [deleteUserTrigger]
  });