import { Handler } from "aws-lambda";
import { updateCourse } from "../../../../services/examples/course/update/update.course.service";
import { successResponse, errorResponse, BadRequestError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const handler: Handler = async (event) => {
  try {
    const courseId = event.pathParameters?.id;

    // Course id missing
    if (!courseId) {
      throw BadRequestError("Course id is required");
    }

    //Invalid ObjectId
    if (!ObjectId.isValid(courseId)) {
      throw BadRequestError("Invalid Course id format");
    }

    //Parse request body (new Course data)
    if (!event.body) {
      throw BadRequestError("Request body is required");
    }

    const courseData = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!courseData) {
      throw BadRequestError("Invalid request body");
    }

    const updatedCourse = await updateCourse(courseId, courseData);

    return successResponse("Course updated successfully", updatedCourse);

  } catch (error: any) {
    console.error("Error updating course:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal Server Error",
      error.statusCode ?? 500
    );
  }
};
