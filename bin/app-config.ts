import { ApiGateway, AppStack, Authorizer, FunctionConfig, getState, Stage, Vpc, WebsocketApi } from "osff-dsl";
import path from "path";

import { courseGetFunction } from "../src/apis/examples/courses/get/get-course.config"
import { courseListFunction } from "../src/apis/examples/courses/list/list-course.config"
import { usersListFunction } from "../src/apis/examples/users/list/get-users.config"
import { createUserFunction } from "@/apis/examples/users/create/create-user.config";
import { getUserFunction } from "@/apis/examples/users/get/get-user.config";
import { updateUserFunction } from "@/apis/examples/users/update/update-user.config";
import { deleteUserFunction } from "@/apis/examples/users/delete/delete-user.config";

// Create object instances
const authFunction = new FunctionConfig({
    name: "auth-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler: "index.handler",
    srcFile: "src/apis/examples/authorizer.ts",
    output: path.resolve(process.cwd(), "dist/src/apis/examples/authorizer.js"),
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
    functions: [
      courseGetFunction, 
      courseListFunction, 
      usersListFunction, 
      createUserFunction, 
      getUserFunction,
      updateUserFunction,
      deleteUserFunction,
    ]
  }
  );
  
  // To generate JSON
  // console.log(JSON.stringify(appStack, null, 2));