# OSFF - Open Serverless Function Framework 

A cloud-agnostic serverless framework that lets developers focus on business logic while automating infrastructure deployment. Built with TypeScript, currently supporting **AWS Lambda** and **standalone API** services with **HTTP REST API** and **WebSocket** capabilities.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/lang-typescript-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Multi-cloud support** (AWS Lambda implemented, more coming)
- **Single configuration file** (`app-config.json`) driven
- **Infrastructure as Code** with AWS CDK integration
- **Environment-aware deployments** (local/dev/production)
- **HTTP & WebSocket API support**
- **Custom Authorizers**
- **VPC Configuration**
- **Automatic environment variable management**
- **TypeScript-first development**

## Getting Started

### Prerequisites
- Node.js 22+
- AWS CDK installed (`npm install -g aws-cdk`)
- AWS credentials configured (for cloud deployments)
- TypeScript 4.7+

### Installation
```
git clone project-git-url
```

## Quick Start

1. **Initialize your project**
```bash
mkdir osff
cd osff
npm init -y
```

2. **Create your first function**
`src/lambda-handler/hello.ts`:
```typescript
export const handler = async (event: any) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from Serverless!" })
  };
};
```

3. **Configure `deploy.ts`**

deploy.ts file have the app configuration using this configuration we can update the serverless stack.
```ts
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
    [helloFunction] // here we can append the functions
);
```
#### Function Configuration
Using following steps we can create new function.
- 1. create new handler like following example. 
```ts

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
```
- 2. create new service file for that function. all business logic should have only on this file. you can example service file in following directory 
```
/src/services/course/create-course.ts
```

4. **Build & Deploy**
```bash
# Build TypeScript files
npm run build

# Deploy infrastructure
cdk deploy
```

## ⚙️ Configuration Guide

The deploy.ts file creates the AppStack using app.ts. This class returns the following JSON, which the actual CDK relies on to function. However, no modifications are needed here, as the deploy.ts file alone is sufficient for all basic operations. If you need to make any modifications to the CDK stack, you can use this file. 

### Core Structure
```json5
{
  "appName": "string",         // Application name
  "version": "string",         // App version
  "region": "string",          // Cloud provider region
  "stage": "string",           // Deployment stage (local|dev|production)
  "provider": "string",        // Cloud provider (aws)
  "envFile": { /* ... */ },    // Environment files per stage
  "authorizer": [ /* ... */ ], // Custom authorizers
  "vpc": [ /* ... */ ],        // VPC configurations
  "apiGateway": [ /* ... */ ], // HTTP API configurations
  "websocketApi": [ /* ... */ ], // WebSocket API configs
  "functions": [ /* ... */ ]   // Serverless functions
}
```

### Key Features

#### Environment Variables
```json
"envFile": {
  "local": "../environment/.local.env",
  "dev": "../environment/.dev.env",
  "production": "../environment/.production.env"
}
```
## Deployment

### Build Project
```bash
npm run build
```

### Deploy to AWS
```bash
cdk bootstrap
cdk deploy
```

### Environment-specific Deployment
```bash
STAGE=production cdk deploy
```

## Environment Variables

Use `.env` files with variable substitution:
```env
frontendUrl=https://yourapp.com
cors=https://yourapp.com,http://localhost:3000
```

Access in config:
```json
"${env.frontendUrl}"
```

## Contributing

We welcome contributions! Please see our [Contribution Guidelines](CONTRIBUTING.md).

## Support

Open an issue or reach out via [email/discord/slack channel].

## License

MIT © [Your Name]


