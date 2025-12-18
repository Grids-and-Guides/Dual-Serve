import { Handler } from "aws-lambda";
import { updateCourse } from "../../../../services/examples/course/update/update.course.service";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { ObjectId } from "mongodb";
import { validateRequest } from "../../../../shared/validation";
import {
  updateCoursePathSchema,
  updateCourseBodySchema,
  UpdateCoursePathRequest,
  UpdateCourseBodyRequest,
} from "./update-course.dto";

export const handler: Handler = async (event) => {
  try {
    // Validate path params
    const pathParams = validateRequest<UpdateCoursePathRequest>({
      schema: updateCoursePathSchema,
      data: {
        id: event.pathParameters?.id,
      },
    });

    const courseId = pathParams.id;

    // ObjectId check
    if (!ObjectId.isValid(courseId)) {
      throw BadRequestError("Invalid course id format");
    }

    // Parse body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    // Validate body
    const courseData = validateRequest<UpdateCourseBodyRequest>({
      schema: updateCourseBodySchema,
      data: body,
    });

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
