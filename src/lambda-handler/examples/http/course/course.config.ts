import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';

const courseTrigger = new Trigger(
    "http",
    "course",
    "GET",
    "application/json",
    "my-serverless-app-${self.stage}",
    "custom-auth"
  );
  
export const courseFunction = new FunctionConfig(
    "course-${self.stage}",
    "lambda.Runtime.NODEJS_22_X",
    "index.handler",
    path.resolve(process.cwd(),"src/lambda-handler/examples/http/course/course.ts"),
    path.resolve(process.cwd(), "dist/lambda-handler/examples/http/course/course.js"),
    256,
    10,
    30,
    {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    [courseTrigger]
  );