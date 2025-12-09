import { Handler } from "aws-lambda";
import { getUser } from "../../../../services/users/get/get-user.service";
import { BadRequestError, errorResponse, successResponse } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const handler: Handler = async (event) => {
    try {

        const userId = event.pathParameters?.id

        if (!userId) {
            throw BadRequestError("User ID is required");
        }

        if (!ObjectId.isValid(userId)) {
            throw BadRequestError('Invalid user ID format');
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
