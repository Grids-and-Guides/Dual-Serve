import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const createUserTrigger = new Trigger({
    type: "http",
    endpoint: "users",
    method: "POST",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
});

export const createUserFunction = new FunctionConfig({
    name: "createUser-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(), "src/api/examples/users/create/create-user.ts"),
    output: path.resolve(process.cwd(), "dist/src/api/examples/users/create/index.ts"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [createUserTrigger]
});