import path from "path";
import { FunctionConfig, Trigger } from 'osff-dsl';

const healthCheckTrigger = new Trigger({
  type: "http",
  endpoint: "check",
  method: "GET",
  responseType: "application/json",
  apiGatewayName: "my-serverless-app-${self.stage}",
  authorizer: ""
});

// const healthCheckUrlTrigger = new Trigger({
//   type: "functionUrl",
//   endpoint: "",
//   method: "",
//   responseType: "application/json",
//   apiGatewayName: "",
//   authorizer: "",
//   cors: `{"allowOrigins": ["http://localhost:5500"], "allowMethods": ["GET","POST","PUT","DELETE","OPTION"]}`
// });

const healthCheckEventbrigeTrigger = new Trigger({
  type: "scheduler",
  endpoint: "",
  method: "",
  responseType: "application/json",
  apiGatewayName: "",
  authorizer: "",
  scheduleExpression: "cron(*/2 * * * *)"
});

export const healthCheckFunction = new FunctionConfig({
  name: "health-check-${self.stage}",
  runtime: "lambda.Runtime.NODEJS_22_X",
  handler: "index.handler",
  srcFile: path.resolve(
    process.cwd(),
    "src/api/http/health-check/health-check.ts"
  ),
  output: path.resolve(
    process.cwd(),
    "dist/api/http/health-check/health-check.js"
  ),
  memory: 256,
  concurrency: 1,
  timeout: 30,
  environmentVariable: {
    cors: "${env.cors}"
  },
  triggers: [healthCheckTrigger, healthCheckEventbrigeTrigger]
});