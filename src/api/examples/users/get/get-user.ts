import { Handler } from "aws-lambda";
import { getUser } from "../../../../services/examples/users/get/get-user.service";
import {
  BadRequestError,
  errorResponse,
  successResponse,
} from "../../../../shared/response";
import { ObjectId } from "mongodb";
import { validateRequest } from "../../../../shared/validation";
import {
  getUserRequestSchema,
  GetUserRequest,
} from "./get-user.dto";

export const handler: Handler = async (event) => {
  try {
    // Validate path params
    const request = validateRequest<GetUserRequest>({
      schema: getUserRequestSchema,
      data: {
        id: event.pathParameters?.id,
      },
    });

    const userId = request.id;

    // ObjectId check
    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user ID format");
    }

    const userData = await getUser(userId);

    return successResponse("User fetched successfully", userData);
  } catch (error: any) {
    console.error("Error in get user lambda:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
