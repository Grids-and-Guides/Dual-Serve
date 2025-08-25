import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const courseTrigger = new Trigger({
    type: "http",
    endpoint: "course",
    method: "GET",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const courseFunction = new FunctionConfig({
    name: "course-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/lambda-handler/examples/http/course/course.ts"),
    output: path.resolve(process.cwd(), "dist/lambda-handler/examples/http/course/course.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [courseTrigger]
  });