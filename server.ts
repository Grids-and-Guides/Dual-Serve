import { Request, Response, Express } from "express";
import express from "express"
import path from "path";
import dotenv from "dotenv";
// import fs from "fs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FunctionConfig } from "osff-dsl";
import { appStack as appConfig } from "./bin/app-config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export const lambdaExpressAdapter =
  (lambdaHandler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) =>
    async (req: Request, res: Response) => {
      const queryStringParameters: Record<string, string> = {};

      Object.entries(req.query).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (typeof value === 'string') {
          queryStringParameters[key] = value;
        } else if (Array.isArray(value)) {
          queryStringParameters[key] = value[0] as any; // First item
        } else {
          // fallback for ParsedQs object or any other type
          queryStringParameters[key] = JSON.stringify(value);
        }
      });

      const event: APIGatewayProxyEvent = {
        body: req.body ? JSON.stringify(req.body) : null,
        headers: req.headers as any,
        httpMethod: req.method,
        isBase64Encoded: false,
        path: req.path,
        pathParameters: req.params,
        queryStringParameters: queryStringParameters,
        multiValueQueryStringParameters: null,
        multiValueHeaders: {},
        stageVariables: null,
        requestContext: {} as any,
        resource: "",
      };

      try {
        const result = await lambdaHandler(event);
        res.status(result.statusCode).set(result.headers || {}).send(result.body);
      } catch (err: any) {
        console.error("Handler error:", err);
        res.status(500).send("Internal Server Error");
      }
    };

// Helper: Load and execute the handler
function loadHandler(outputPath: string, handlerRef: string) {
  const module = require(outputPath);
  const [obj, fn] = handlerRef.split(".");
  return module[fn] || module[obj] || module;
}

export const registerRoutes = async (app: Express) => {
  const stage = argv.stage;
  console.log("stage: ", stage)
  const envPath = path.resolve(__dirname, `./environment/.${argv.stage}.env`);
  dotenv.config({ path: envPath });
  const functions: FunctionConfig[] = appConfig.functions;

  for (const func of functions) {
    if (!func.triggers) continue;

    for (const trigger of func.triggers) {
      if (trigger.type !== "http") continue;

      const method = trigger.method.toLowerCase();
      const route = "/" + trigger.endpoint.replace(/\$/g, ":");

      const handler = loadHandler(func.srcFile, func.handler);

      if (typeof handler !== "function") {
        console.warn(`Invalid handler function for ${func.name}`);
        continue;
      }

      console.log(`Mounting [${method.toUpperCase()}] ${route}`);
      (app as any)[method](route, lambdaExpressAdapter(handler));
    }
  }
};

// CLI argument parsing
const argv = yargs(hideBin(process.argv))
  .option("port", {
    type: "number",
    default: 3001,
    describe: "Port to run the server on",
  })
  .option("stage", {
    type: "string",
    default: "dev",
    describe: "Stage environment (e.g. dev, prod)",
  })
  .parseSync();


async function main() {
  const app = express();
  app.use(express.json());
  // Register the routes
  registerRoutes(app);
  const PORT = argv.port || 3001;
  process.env.STAGE = argv.stage;
  app.listen(PORT, () => {
    console.log(`🚀 ${process.env.STAGE} - Server running at http://localhost:${PORT}`);
  });
}

main()
