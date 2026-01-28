import z from "zod";
import { BadRequestError } from "./response";

export function validateRequest<T>({
  schema,
  data,
}: {
  schema: z.ZodType<T, any, any>;
  data: unknown;
}): T {
  try {
    const request = schema.parse(data);

    return request;
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.error("Validation errors:", e.issues);
      throw BadRequestError(e.issues[0]?.message || "Invalid request payload");
    } else {
      console.error("Unknown error", e);
      throw new Error("Internal server error");
    }
  }
}
