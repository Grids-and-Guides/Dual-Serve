import { Handler } from "aws-lambda";
import { validateRequest } from "../../../../shared/validation";
import {
  getListUsersRequestSchema,
  GetListUsersRequest,
} from "./list-user.dto";
import { getUsersList } from "../../../../services/examples/users/list/get-users.service";
import { successResponse, errorResponse } from "../../../../shared/response";

export const handler: Handler = async (event) => {
  try {
    // Validate query params
    const request = validateRequest<GetListUsersRequest>({
      schema: getListUsersRequestSchema,
      data: {
        ...(event.queryStringParameters || {}),
      },
    });

    const usersData = await getUsersList(
      request.page,
      request.limit,
      request.search,
      request.sortBy,
      request.sortOrder
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
