import { Request, Response, Express } from "express";
import express from "express"
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import cors from "cors";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { FunctionConfig } from "osff-dsl";
import { appStack as appConfig } from "./bin/app-config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { generateSwagger } from "auto-swagger/generate-minimal-swagger";

// AUTHORIZER REGISTRY (ADD ONLY)
const authorizersMap = new Map<string, FunctionConfig>();

for (const auth of appConfig.config.authorizer || []) {
  authorizersMap.set(auth.config.name, auth.config.authFunction);
}

export const lambdaExpressAdapter =
  (getLambdaHandler: () => (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>) =>
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
        const lambdaHandler = getLambdaHandler();

        const result = await lambdaHandler(event);
        res.status(result.statusCode).set(result.headers || {}).send(result.body);
      } catch (err: any) {
        console.error("Handler error:", err);
        res.status(500).send("Internal Server Error");
      }
    };

// Check whether the run command is development run 
function isTsNode() {
  return (
    (process as any)[Symbol.for("ts-node.register.instance")] !== undefined ||
    process.argv.some((arg) => arg.includes("ts-node"))
  );
}

// Helper: Load and execute the handler
function loadHandler(outputPath: string, handlerRef: string) {
  console.time("load-time")
  const module = require(outputPath);
  console.timeEnd("load-time")
  const [obj, fn] = handlerRef.split(".");
  return module[fn] || module[obj] || module;
}

const createLazyHandler = (outputPath: string, handlerRef: string) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const handler = loadHandler(outputPath, handlerRef);
    return handler(event);
  };
};

function buildAuthorizerEvent(req: Request) {
  return {
    type: "TOKEN",
    authorizationToken: req.headers["authorization"] || "",
    methodArn: `arn:aws:execute-api:us-east-1:123456789012:abcdef123/dev/${req.method}${req.path}`,
  };
}

function authorizerMiddleware(
  authorizerFunc: (event: any) => Promise<any>
) {
  return async (req: Request, res: Response, next: Function) => {
    try {
      const event = buildAuthorizerEvent(req);
      const authResult = await authorizerFunc(event);

      const effect =
        authResult?.policyDocument?.Statement?.[0]?.Effect;

      if (effect === "Allow") {
        return next();
      }

      return res.status(401).json({ message: "Unauthorized" });
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  };
}

const createLazyAuthorizer = (outputPath: string, handlerRef: string) => {
  return async (event: any) => {
    const handler = loadHandler(outputPath, handlerRef);
    return handler(event);
  };
};


export const registerRoutes = async (app: Express) => {
  const stage = argv.stage;
  console.log("stage: ", stage)
  const envPath = path.resolve(__dirname, `./environment/.${argv.stage}.env`);
  dotenv.config({ path: envPath });
  const functions: FunctionConfig[] = appConfig.config.functions;

  console.time("Route Registration");

  for (const func of functions) {
    if (!func.config.triggers) continue;

    for (const trigger of func.config.triggers) {
      if (trigger.config.type !== "http") continue;

      const method = trigger.config.method.toLowerCase();
      const route = "/" + trigger.config.endpoint.replace(/\$/g, ":");

      const handlerPath = isTsNode() ? func.config.srcFile : func.config.output; // check whether it is development run or build

      const lazyHandler = createLazyHandler(handlerPath, func.config.handler);

      console.log(`Mounting [${method.toUpperCase()}] ${route}`);

      const middlewares: any[] = [];

      // ADD AUTHORIZER ONLY IF CONFIGURED
      if (trigger.config.authorizer && authorizersMap.has(trigger.config.authorizer)) {
        const authFunc = authorizersMap.get(trigger.config.authorizer)!;
        const authPath = isTsNode()
          ? authFunc.config.srcFile
          : authFunc.config.output;

        const lazyAuth = createLazyAuthorizer(
          authPath,
          authFunc.config.handler
        );
        middlewares.push(authorizerMiddleware(lazyAuth));
      }

      middlewares.push(lambdaExpressAdapter(() => lazyHandler));

      (app as any)[method](route, ...middlewares);

    }
  }
  console.timeEnd("Route Registration");
};

// CLI argument parsing
const argv = yargs(hideBin(process.argv))
  .option("port", {
    type: "number",
    default: 8000,
    describe: "Port to run the server on",
  })
  .option("stage", {
    type: "string",
    default: "dev",
    describe: "Stage environment (e.g. dev, prod)",
  })
  .parseSync();

function parseCorsEnv(envValue: string | undefined) {
  if (!envValue) return {};
  try {
    return JSON.parse(envValue);
  } catch (e) {
    console.error("Failed to parse CORS env:", e);
    return {};
  }
}

function setupCors(app: Express) {
  const corsConfig = parseCorsEnv(process.env.cors);

  if (!corsConfig) {
    return;
  }

  console.log("Setting up CORS...");

  const corsOptions = {
    origin: corsConfig.allowOrigins || "",
    methods: corsConfig.allowMethods || [],
  };

  app.use(cors(corsOptions));
}

function loadEnvironments(stage: string) {
  const envPath = path.resolve(__dirname, `./environment/.${stage}.env`);

  dotenv.config({ path: envPath });
}

async function main() {
  const app = express();
  app.use(express.json());

  const stage = argv.stage;

  console.log("Stage:: ", stage);

  // Load ENV
  loadEnvironments(stage);

  // Setup cors
  setupCors(app);

  // Register the routes
  registerRoutes(app);

  const PORT = argv.port || 8000;
  process.env.STAGE = argv.stage;

  try {
    await generateSwagger()

    const swaggerPath = path.resolve(process.cwd(), "openapi.generated.json");

    if (fs.existsSync(swaggerPath)) {
      const swaggerDoc = JSON.parse(fs.readFileSync(swaggerPath, "utf8"));
      app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));
      console.log("Swagger running at /docs");
    } else {
      console.log("Swagger file missing");
    }
  } catch (err) {
    console.error("Swagger setup failed", err);
  }


  app.listen(PORT, () => {
    console.log(`🚀 ${process.env.STAGE} - Server running at http://localhost:${PORT}`);
  });
}

main()
