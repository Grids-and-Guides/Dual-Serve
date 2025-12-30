import { Handler } from "aws-lambda";
import { getCourse } from "../../../../services/examples/course/get/get-course.service";
import { BadRequestError, errorResponse, successResponse } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const handler: Handler = async (event) => {
  try {
    const courseId = event.pathParameters?.id;

    if (!courseId) {
      throw BadRequestError("Course ID is required");
    }

    if (!ObjectId.isValid(courseId)) {
      throw BadRequestError("Invalid course ID format");
    }

    const courseData = await getCourse(courseId);

    return successResponse("Course fetched successfully", courseData);

  } catch (error: any) {
    console.error("Error in get course lambda:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
