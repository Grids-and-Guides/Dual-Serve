import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { createUser } from "../../../../services/examples/users/create/create-user.service";
import {
  createUserRequestSchema,
  CreateUserRequest,
} from "./create-user.dto";
import { validateRequest } from "../../../../shared/validation";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body || Object.keys(body).length === 0) {
      throw BadRequestError("Request body is required");
    }

    // Validate request
    const request = validateRequest<CreateUserRequest>({
      schema: createUserRequestSchema,
      data: body,
    });

    const result = await createUser(request);
 
    return successResponse("User created successfully", result, 201);

  } catch (error: any) {
    console.error("Error creating user:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
