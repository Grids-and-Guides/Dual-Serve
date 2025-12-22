import path from "path";

//TYPES

type FieldInfo = {
  type?: string | null;
  defaultValue?: string | number;
  enumValue?: Record<string, string | number>;
  minLength?: number | null;
  required?: boolean | null;
  in?: "path" | "query" | "body" | null;
};

type SchemaInfo = Record<string, FieldInfo>;

type SwaggerRoute = {
  endpoint: string;
  method: string;
  responseType: string;
  authorizer: string;
  requestSchemaData: SchemaInfo | null;
};

//META READER

function readMeta(
  field: any
): { in?: "path" | "query" | "body" } | null {
  let current = field;

  while (current) {
    if (typeof current.meta === "function") {
      const meta = current.meta();
      if (meta) return meta;
    }

    current =
      current._def?.innerType ||
      current._def?.schema ||
      null;
  }

  return null;
}

/* ======================
   ZOD UNWRAP HELPER
====================== */

function unwrapZod(field: any): {
  type: string | null;
  defaultValue?: string | number;
  enumValue?: Record<string, string | number>;
  minLength?: number | null;
} {
  let current = field;

  let defaultValue: string | number | undefined;
  let enumValue: Record<string, string | number> | undefined;
  let minLength: number | null = null;

  while (current) {
    // default()
    if (current.def?.type === "default") {
      defaultValue = current.def.defaultValue;
    }

    // enum
    if (current.enum) {
      enumValue = current.enum;
    }

    // string min length
    if (typeof current.minLength === "number") {
      minLength = current.minLength;
    }

    // base type reached
    if (
      current.type &&
      !["optional", "default", "nullable"].includes(current.type)
    ) {
      return {
        type: current.type,
        defaultValue,
        enumValue,
        minLength,
      };
    }

    current =
      current.def?.innerType ||
      current.def?.schema ||
      null;
  }

  return {
    type: null,
    defaultValue,
    enumValue,
    minLength,
  };
}

//ZOD SCHEMA READER

function extractZodSchemaData(schema: any): SchemaInfo | null {
  try {
    const shape = schema?.def?.shape ?? null;
    if (!shape) return null;

    const result: SchemaInfo = {};

    for (const fieldName of Object.keys(shape)) {
      const zodField = shape[fieldName];

      const meta = readMeta(zodField);
      const location = meta?.in ?? "body";

      const required = !zodField.isOptional();

      const unwrapped = unwrapZod(zodField);

      const fieldInfo: FieldInfo = {
        type: unwrapped.type,
        required,
        in: location,
      };

      if (unwrapped.defaultValue !== undefined) {
        fieldInfo.defaultValue = unwrapped.defaultValue;
      }

      if (unwrapped.enumValue !== undefined) {
        fieldInfo.enumValue = unwrapped.enumValue;
      }

      if (unwrapped.minLength !== null) {
        fieldInfo.minLength = unwrapped.minLength;
      }

      result[fieldName] = fieldInfo;
    }

    return result;
  } catch (err) {
    console.error("Zod schema read error:", err);
    return null;
  }
}

//MAIN FUNCTION

export async function getSwaggerDetails(): Promise<SwaggerRoute[]> {
  const routes: SwaggerRoute[] = [];

  const configPath = path.resolve(process.cwd(), "bin/app-config.ts");
  const importedConfig = await import(configPath);
  const appStack = importedConfig.appStack;

  if (!appStack) return routes;

  const functions = appStack.config?.functions ?? [];

  for (const func of functions) {
    const triggers = func.config?.triggers ?? [];

    for (const trigger of triggers) {
      if (trigger.config?.type !== "http") continue;

      const method = trigger.config.method;
      if (!method || typeof method !== "string") continue;

      const endpoint = trigger.config.endpoint.startsWith("/")
        ? trigger.config.endpoint
        : "/" + trigger.config.endpoint;

      const schema = trigger.config.requestSchema ?? null;
      const schemaData = schema ? extractZodSchemaData(schema) : null;

      routes.push({
        endpoint,
        method: method.toUpperCase(),
        responseType: trigger.config.responseType ?? "application/json",
        authorizer: trigger.config.authorizer ?? "",
        requestSchemaData: schemaData,
      });
    }
  }

  return routes;
}


// DEBUG RUN

if (require.main === module) {
  getSwaggerDetails().then((r) => {
    console.log("total routes:", r.length);
  });
}
