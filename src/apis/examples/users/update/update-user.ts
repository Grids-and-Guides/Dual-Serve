import { Handler } from "aws-lambda";
import { updateUser } from "../../../../services/examples/users/update/update-user.service";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { validateRequest } from "../../../../shared/validation";
import {
  updateUserPathSchema,
  updateUserBodySchema,
  UpdateUserPathRequest,
  UpdateUserBodyRequest,
} from "./update-user.dto";
import { ObjectId } from "mongodb";

export const handler: Handler = async (event) => {
  try {
    // Validate path params
    const pathParams = validateRequest<UpdateUserPathRequest>({
      schema: updateUserPathSchema,
      data: {
        id: event.pathParameters?.id,
      },
    });

    const userId = pathParams.id;

    // ObjectId check
    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user id format");
    }

    // Parse body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body || Object.keys(body).length === 0) {
      throw BadRequestError("Request body is required");
    }

    // Validate body
    const userData = validateRequest<UpdateUserBodyRequest>({
      schema: updateUserBodySchema,
      data: body,
    });

    const updatedUser = await updateUser(userId, userData);

    return successResponse("User updated successfully", updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal Server Error",
      error.statusCode ?? 500
    );
  }
};
