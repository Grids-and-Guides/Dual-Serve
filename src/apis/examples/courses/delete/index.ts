import { APIGatewayProxyEvent } from "aws-lambda";
import { ObjectId } from "mongodb";
import {
  successResponse,
  errorResponse,
  BadRequestError,
  NotFoundError,
} from "../../../../shared/response";
import { deleteCourse } from './../../../../services/course/delete/delete-course.service';

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const courseId = event.pathParameters?.id;

    if (!courseId) {
      throw BadRequestError("Course id is required");
    }

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
