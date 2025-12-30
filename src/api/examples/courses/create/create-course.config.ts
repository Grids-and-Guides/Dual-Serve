import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const createCourseTrigger = new Trigger({
    type: "http",
    endpoint: "courses",
    method: "POST",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
});

export const createCourseFunction = new FunctionConfig({
    name: "createCourse-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(), "src/api/examples/courses/create/create-course.ts"),
    output: path.resolve(process.cwd(), "dist/src/api/examples/courses/create/index.ts"),
    memory:256,
    concurrency: 10,
    timeout:30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [createCourseTrigger]
});