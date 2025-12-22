import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const courseListTrigger = new Trigger({
    type: "http",
    endpoint: "courses",
    method: "GET",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const courseListFunction = new FunctionConfig({
    name: "course-list-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/api/examples/courses/list/list-course.ts"),
    output: path.resolve(process.cwd(), "dist/src/api/examples/courses/list/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [courseListTrigger]
  });