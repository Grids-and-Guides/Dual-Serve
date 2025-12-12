import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const updateCourseTrigger = new Trigger({
    type: "http",
    endpoint: "courses/:id",
    method: "PUT",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const updateCourseFunction = new FunctionConfig({
    name: "update-course-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/apis/examples/courses/update/update-course.ts"),
    output: path.resolve(process.cwd(), "dist/src/apis/examples/courses/update/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [updateCourseTrigger]
  });