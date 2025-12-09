// src/apis/example/users/update/update-user.ts
import { Handler } from "aws-lambda";
import { updateUser } from "../../../../services/users/update/update-user.service";
import { successResponse, errorResponse, BadRequestError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const handler: Handler = async (event) => {
  try {
    const userId = event.pathParameters?.id;

    // User id missing
    if (!userId) {
      throw BadRequestError("User id is required");
    }

    //Invalid ObjectId
    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user id format");
    }

    //Parse request body (new user data)
    if (!event.body) {
      throw BadRequestError("Request body is required");
    }

    const userData = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!userData) {
      throw BadRequestError("Invalid request body");
    }

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
