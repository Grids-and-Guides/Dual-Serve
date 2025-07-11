import { ApiGateway, AppStack, Authorizer, FunctionConfig, getState, Stage, Vpc, WebsocketApi } from "osff-dsl";
import { helloFunction } from "../src/lambda-handler/examples/http/hello";
import { courseFunction } from "../src/lambda-handler/examples/http/course/course.config";
import path from "path";

// Create object instances
const authFunction = new FunctionConfig(
    "auth-${self.stage}",
    "lambda.Runtime.NODEJS_22_X",
    "index.handler",
    "src/lambda-handler/examples/http/authorizer.ts",
    path.resolve(process.cwd(), "dist/lambda-handler/examples/http/authorizer/index.js"),
    256,
    10,
    30,
    {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    }
  );

export const appStack = new AppStack(
    "CDK lambda",
    "1.0.0",
    "ap-south-1",
    getState(Stage.Local),
    "aws",
    {
      "local": "../environment/.local.env",
      "dev": "../environment/.dev.env",
      "production": "../environment/.production.env"
    },
    [new Authorizer("custom-auth", "restApi", authFunction)],
    [new Vpc("vpc-1")],
    [
      new ApiGateway(
        "my-serverless-app-${self.stage}",
        "http",
        "custom",
        "${env.cors}"
      )
    ],
    [
      new WebsocketApi(
        "my-websocket-api-${self.stage}",
        "$request.body.action",
        "${self.stage}"
      )
    ],
    [helloFunction, courseFunction]
  );
  
  // To generate JSON
  // console.log(JSON.stringify(appStack, null, 2));