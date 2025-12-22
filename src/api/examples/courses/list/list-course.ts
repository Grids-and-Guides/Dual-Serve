import { Handler } from "aws-lambda";
import { validateRequest } from "../../../../shared/validation";
import { getCoursesRequestSchema } from "./list-course.dto";
import { getCoursesList } from "../../../../services/examples/course/list/list-course.service";
import { successResponse, errorResponse } from "../../../../shared/response";

export const handler: Handler = async (event) => {
  try {
    // Validate query params
    const params = validateRequest({
      schema: getCoursesRequestSchema,
      data: {
        ...(event.queryStringParameters || {}),
      },
    });

    const coursesData = await getCoursesList(
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder
    );

    return successResponse("Courses fetched successfully", coursesData);

  } catch (error: any) {
    console.error("Error in get courses lambda:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
