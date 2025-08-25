import { ApiGateway, AppStack, Authorizer, FunctionConfig, getState, Stage, Vpc, WebsocketApi } from "osff-dsl";
import { helloFunction } from "../src/lambda-handler/examples/http/hello";
import { courseFunction } from "../src/lambda-handler/examples/http/course/course.config";
import path from "path";

// Create object instances
const authFunction = new FunctionConfig({
    name: "auth-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler: "index.handler",
    srcFile: "src/lambda-handler/examples/http/authorizer.ts",
    output: path.resolve(process.cwd(), "dist/lambda-handler/examples/http/authorizer/index.js"),
    memory: 256,
    concurrency: 10,
    timeout: 30,
    environmentVariable:{
      MONGODB_URI: "localhost:db",
      frontendUrl: "${env.frontendUrl}",
      functionName: "${currentFunction.name}",
      cors: "${env.cors}"
    }
  });

export const appStack = new AppStack({
    appName: "CDK lambda",
    version: "1.0.0",
    region: "ap-south-1",
    stage: getState(Stage.Local),
    provider: "aws",
    envFile: {
      "local": "../environment/.local.env",
      "dev": "../environment/.dev.env",
      "production": "../environment/.production.env"
    },
    authorizer: [new Authorizer({name: "custom-auth", type: "restApi", authFunction: authFunction})],
    vpc: [new Vpc({name:"vpc-1"})],
    apiGateway: [
      new ApiGateway({
        name: "my-serverless-app-${self.stage}",
        type: "http",
        authenticationType: "custom",
        cors: "${env.cors}"
    })
    ],
    websocketApi: [
      new WebsocketApi({
        name: "my-websocket-api-${self.stage}",
        routeSelectionExpression: "$request.body.action",
        stageName: "${self.stage}"
      })
    ],
    functions: [helloFunction, courseFunction]
  }
  );
  
  // To generate JSON
  // console.log(JSON.stringify(appStack, null, 2));