
import { Handler } from 'aws-lambda';
import { sayHello } from '../../../services/examples/hello';
import { FunctionConfig, Trigger } from 'osff-dsl';
import path from 'path';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { json } from 'stream/consumers';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  console.log("qp", event.queryStringParameters);
  const result = await sayHello(event.body?JSON.parse(event.body):{}, event.headers, {});
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `User ${id} fetched.` }),
  };
};

// export const handler: Handler = async (event, context) => {
//     console.log('EVENT: \n' + JSON.stringify(event, null, 2));
//     const result = await sayHello(event.body, event.headers, context);
//     return JSON.stringify({ message: result});
// };

const helloTrigger = new Trigger({
    type: "http",
    endpoint: "hello/:id",
    method: "GET",
    responseType: "application/json",
    apiGatewayName: "my-serverless-app-${self.stage}",
    authorizer: "custom-auth"
  });
  
export const helloFunction = new FunctionConfig({
    name: "hello-${self.stage}",
    runtime: "lambda.Runtime.NODEJS_22_X",
    handler:"index.handler",
    srcFile: path.resolve(process.cwd(),"src/lambda-handler/examples/http/hello.ts"),
    output: path.resolve(process.cwd(), "dist/lambda-handler/examples/http/hello/index.js"),
    memory: 256,
    concurrency: 10,
    timeout: 30,
    environmentVariable: {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    triggers: [helloTrigger]
  }
  );