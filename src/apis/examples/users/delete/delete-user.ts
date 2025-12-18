import { APIGatewayProxyEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import {
  successResponse,
  errorResponse,
  BadRequestError,
  NotFoundError,
} from "../../../../shared/response";
import { deleteUser } from "../../../../services/examples/users/delete/delete-user.service";
import { validateRequest } from "../../../../shared/validation";
import {
  deleteUserRequestSchema,
  DeleteUserRequest,
} from "./delete-user.dto";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Validate path params
    const request = validateRequest<DeleteUserRequest>({
      schema: deleteUserRequestSchema,
      data: {
        id: event.pathParameters?.id,
      },
    });

    const userId = request.id;

    // ObjectId check
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
