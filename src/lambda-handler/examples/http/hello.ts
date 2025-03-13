
import { Handler } from 'aws-lambda';
import { sayHello } from '../../../services/examples/hello';
import { FunctionConfig, Trigger } from '../../../../app';

export const handler: Handler = async (event, context) => {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    const result = await sayHello(event.body, event.headers, context);
    return JSON.stringify({ message: result});
};

const helloTrigger = new Trigger(
    "http",
    "hello",
    "GET",
    "application/json",
    "my-serverless-app-${self.stage}",
    "custom-auth"
  );
  
export const helloFunction = new FunctionConfig(
    "hello-${self.stage}",
    "lambda.Runtime.NODEJS_22_X",
    "index.handler",
    "src/lambda-handler/examples/http/hello.ts",
    "dist/lambda-handler/examples/http/hello/index.js",
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