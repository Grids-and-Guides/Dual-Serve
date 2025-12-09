import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse, errorResponse, BadRequestError } from "../../../../shared/response";
import { createUser, CreateUserInput } from "../../../../services/users/create/create-user.service";
import { createUserRequestSchema } from "./create-user.dto";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw BadRequestError("Request body is required");
    }

    const userData: CreateUserInput = createUserRequestSchema.parse(
      typeof event.body === "string" ? JSON.parse(event.body) : event.body
    );

    const result = await createUser(userData);
    return successResponse("User created successfully", result);

  } catch (error: any) {
    console.error("Error creating user:", error);
    return errorResponse(error.message ?? null, error.type ?? "Internal server error", error.statusCode ?? 500);
  }
};
