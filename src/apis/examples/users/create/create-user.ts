import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse, errorResponse, BadRequestError } from "../../../../shared/response";
import { createUser, CreateUserInput } from "../../../../services/examples/users/create/create-user.service";
import { createUserRequestSchema } from "./create-user.dto";
import { validateRequest } from "@/shared/validation";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw BadRequestError("Request body is required");
    }

    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body || Object.keys(body).length === 0) {
      throw BadRequestError("Request body is required");
    }

    // Validate request using Zod
    const request = validateRequest<CreateUserInput>({
      schema: createUserRequestSchema,
      data: {
        ...body,
      },
    });

    // Service call
    const result = await createUser(request);
    return successResponse("User created successfully", result);

  } catch (error: any) {
    console.error("Error creating user:", error);
    return errorResponse(error.message ?? null, error.type ?? "Internal server error", error.statusCode ?? 500);
  }
};
