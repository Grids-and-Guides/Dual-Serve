import { APIGatewayProxyEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import {
  successResponse,
  errorResponse,
  BadRequestError,
  NotFoundError,
} from "../../../../shared/response";
import { deleteUser } from "../../../../services/users/delete/delete-user.service";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const userId = event.pathParameters?.id;

    if (!userId) {
      throw BadRequestError("User id is required");
    }

    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user id format");
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      throw NotFoundError("User not found");
    }

    return successResponse("User deleted successfully");

  } catch (error: any) {
    console.error("Error in delete user handler:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal Server Error",
      error.statusCode ?? 500
    );
  }
};
