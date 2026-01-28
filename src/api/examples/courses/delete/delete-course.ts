import { APIGatewayProxyEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import {
  successResponse,
  errorResponse,
  BadRequestError,
  NotFoundError,
} from "../../../../shared/response";
import { deleteCourse } from "../../../../services/examples/course/delete/delete-course.service";
import { validateRequest } from "../../../../shared/validation";
import {
  deleteCourseRequestSchema,
  DeleteCourseRequest,
} from "./delete-course.dto";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    // Validate path params
    const request = validateRequest<DeleteCourseRequest>({
      schema: deleteCourseRequestSchema,
      data: {
        id: event.pathParameters?.id,
      },
    });

    const courseId = request.id;

    // ObjectId check
    if (!ObjectId.isValid(courseId)) {
      throw BadRequestError("Invalid course id format");
    }

    const deleted = await deleteCourse(courseId);

    if (!deleted) {
      throw NotFoundError("Course not found");
    }

    return successResponse("Course deleted successfully");
  } catch (error: any) {
    console.error("Error in delete course handler:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal Server Error",
      error.statusCode ?? 500
    );
  }
};
