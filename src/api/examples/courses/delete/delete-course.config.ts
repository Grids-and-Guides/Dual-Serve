import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';
import { deleteCourseRequestSchema } from './delete-course.dto';

const deleteCourseTrigger = new Trigger({
    type: "http",
    endpoint: "courses/:id",
    method: "DELETE",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth",
    requestSchema:deleteCourseRequestSchema
  });
  
export const deleteCourseFunction = new FunctionConfig({
    name: "delete-course-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/api/examples/courses/delete/delete-course.ts"),
    output: path.resolve(process.cwd(), "dist/src/api/examples/courses/delete/index.js"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [deleteCourseTrigger]
  });