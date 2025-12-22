import fs from "fs";
import path from "path";
import { getSwaggerDetails } from "./get-swagger-details";

type ReqField = {
  type?: any;
  defaultValue?: string | number;
  enumValue?: Record<string, string | number>;
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

function getTagFromEndpoint(endpoint: string): string {
  const clean = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return clean.split("/")[0] || "General";
}

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
    const tagName: string = getTagFromEndpoint(r.endpoint);

    if (!paths[openPath]) paths[openPath] = {};

    const parameters: any[] = [];
    const bodyProps: Record<string, any> = {};
    const bodyRequired: string[] = [];

    if (r.requestSchemaData) {
      for (const key of Object.keys(r.requestSchemaData)) {
        const field = r.requestSchemaData[key];

        // Build schema object with only meaningful values
        const schema: any = {};

        // Add type
        if (field.type !== undefined && field.type !== null) {
          schema.type = field.type;
        }

        // Only add minLength if it's greater than 0
        if (field.minLength && field.minLength > 0) {
          schema.minLength = field.minLength;
        }

        // Only add default if it exists
        if (field.defaultValue !== undefined) {
          schema.default = field.defaultValue;
        }

        // Only add enum if it exists
        if (field.enumValue) {
          schema.enum = Object.values(field.enumValue);
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
        } else {
          bodyProps[key] = schema;
          if (field.required) bodyRequired.push(key);
        }
      }
    }

    const operation: any = {
      tags: [tagName],
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

    // 🔐 ADD THIS PART
    if (r.authorizer === "custom-auth") {
      operation.security = [
        {
          BearerAuth: [],
        },
      ];
    }


    // Only add parameters if there are any
    if (parameters.length > 0) {
      operation.parameters = parameters;
    }

    // Only add requestBody if there are body properties
    if (Object.keys(bodyProps).length > 0) {
      operation.requestBody = {
        required: bodyRequired.length > 0,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: bodyProps,
              ...(bodyRequired.length > 0 && { required: bodyRequired }),
            },
          },
        },
      };
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
          description:
            "Enter your authorization token to access protected routes.",
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

    fs.writeFileSync(outFile, JSON.stringify(openapi, null, 2), {
      encoding: "utf-8",
    });

    console.log(`Swagger file generated at: ${outFile}`);
  } catch (err) {
    console.error("Failed to generate Swagger file", err);
  }
}