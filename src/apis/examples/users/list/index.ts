import { Handler } from "aws-lambda";
import { validateRequest } from "../../../../shared/validation";
import { getUsersRequestSchema } from "./get-users.dto";
import { getUsersList } from "../../../../services/users/list/get-users.service";
import { successResponse, errorResponse } from "../../../../shared/response";

export const handler: Handler = async (event) => {
  try {
    // Validate request query params
    const params = validateRequest({
      schema: getUsersRequestSchema,
      data: {
        ...(event.queryStringParameters || {})
      }
    });

    const usersData = await getUsersList(
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder
    );

    return successResponse("Users fetched successfully", usersData);

  } catch (error: any) {
    console.error("Error in get users lambda:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
