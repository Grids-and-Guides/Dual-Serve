import fs from "fs";
import path from "path";
import { getSwaggerDetails } from "./get-swagger-details";

type ReqField = {
  type?: any;
  defaultValue: string | number,
  minLength?: number | null;
  required?: boolean | null;
  in?: "path" | "query" | "body" | null;
};

type SwaggerItem = {
  endpoint: string;
  method: string;
  responseType: string;
  authorizer: string;
  requestSchemaData: Record<string, ReqField> | null;
};

/**
 * Converts colon-based parameters (:orgid) to curly braces ({orgid})
 */
function convertEndpoint(endpoint: string): string {
  const normalized = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  return normalized.replace(/:(\w+)/g, "{$1}");
}

export async function generateSwagger() {
  const routes = await getSwaggerDetails();
  if (!routes.length) {
    console.error("No routes found to generate Swagger.");
    return;
  }

  const paths: Record<string, any> = {};

  for (const r of routes as SwaggerItem[]) {
    const openPath = convertEndpoint(r.endpoint);
    const method = r.method.toLowerCase();

    if (!paths[openPath]) paths[openPath] = {};

    const parameters: any[] = [];
    const bodyProps: Record<string, any> = {};
    const bodyRequired: string[] = [];

    // Parse Schema Data
    if (r.requestSchemaData) {
      for (const key of Object.keys(r.requestSchemaData)) {
        const field = r.requestSchemaData[key];
        const schema: any = { type: field.type };

        if (field.minLength) schema.minLength = field.minLength;

        if (field.defaultValue !== undefined) {
          schema.default = field.defaultValue;
        }

        if (field.in === "path") {
          parameters.push({
            name: key,
            in: "path",
            required: true,
            schema,
          });
        } else if (field.in === "query") {
          parameters.push({
            name: key,
            in: "query",
            required: !!field.required,
            schema,
          });
        } else if (field.in === "body" || field.in == null) {
          bodyProps[key] = schema;
          if (field.required) bodyRequired.push(key);
        }
      }
    }

    // Build Operation Object
    const operation: any = {
      parameters,
      responses: {
        200: {
          description: "Success",
          content: {
            [r.responseType]: {
              schema: { type: "object" },
            },
          },
        },
      },
    };

    // Add Request Body if needed
    if (Object.keys(bodyProps).length) {
      operation.requestBody = {
        required: bodyRequired.length > 0,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: bodyProps,
              ...(bodyRequired.length ? { required: bodyRequired } : {}),
            },
          },
        },
      };
    }

    /**
     * AUTHENTICATION LOGIC
     */
    if (r.authorizer) {
      operation.security = [
        {
          BearerAuth: [],
        },
      ];
    }

    paths[openPath][method] = operation;
  }

  // Final OpenAPI Specification Object
  const openapi = {
    openapi: "3.0.0",
    info: {
      title: "Auto Generated API",
      version: "1.0.0",
      description: "API documentation with automatic Authorizer detection",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your authorization token to access protected routes.",
        },
      },
    },
    paths,
  };

  const outFile = path.resolve(process.cwd(), "openapi.generated.json");

  try {
    if (fs.existsSync(outFile)) {
      fs.unlinkSync(outFile);
    }

    fs.writeFileSync(
      outFile,
      JSON.stringify(openapi, null, 2),
      { encoding: "utf-8" }
    );

    console.log(`Swagger file generated at: ${outFile}`);
  } catch (err) {
    console.error("Failed to generate Swagger file", err);
  }
  fs.writeFileSync(outFile, JSON.stringify(openapi, null, 2));
  console.log(`Swagger file generated at: ${outFile}`);
}