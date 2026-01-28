import { Handler } from "aws-lambda";
import { updateUser } from "../../../../services/examples/users/update/update-user.service";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { validateRequest } from "../../../../shared/validation";
import { ObjectId } from "mongodb";
import { updateUserBodySchema, UpdateUserRequest } from "./update-user.dto";

export const handler: Handler = async (event) => {
  try {
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body ?? {};

    // Validate path params
    const params = validateRequest<UpdateUserRequest>({
      schema: updateUserBodySchema,
      data: {
        id: event.pathParameters?.id,
        ...body
      },
    });

    const userId = params.id;

    // ObjectId check
    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user id format");
    }


    const updatedUser = await updateUser(userId, params);

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
