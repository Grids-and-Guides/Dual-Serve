
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

const helloTrigger = new Trigger(
    "http",
    "hello/:id",
    "GET",
    "application/json",
    "my-serverless-app-${self.stage}",
    "custom-auth"
  );
  
export const helloFunction = new FunctionConfig(
    "hello-${self.stage}",
    "lambda.Runtime.NODEJS_22_X",
    "index.handler",
    path.resolve(process.cwd(),"src/lambda-handler/examples/http/hello.ts"),
    path.resolve(process.cwd(), "dist/lambda-handler/examples/http/hello/index.js"),
    256,
    10,
    30,
    {
      "MONGODB_URI": "localhost:db",
      "frontendUrl": "${env.frontendUrl}",
      "functionName": "${currentFunction.name}",
      "cors": "${env.cors}"
    },
    [helloTrigger]
  );