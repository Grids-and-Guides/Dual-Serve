import { Handler } from "aws-lambda";
import { ObjectId } from "mongodb";

import { updateCourse } from "../../../../services/examples/course/update/update.course.service";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { validateRequest } from "../../../../shared/validation";
import {
  UpdateCourseRequest,
  updateCourseSchema,
} from "./update-course.dto";

export const handler: Handler = async (event) => {
  try {
    // Safe body parse
    const body =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body ?? {};

    // Validate request
    const params = validateRequest<UpdateCourseRequest>({
      schema: updateCourseSchema,
      data: {
        id: event.pathParameters?.id,
        ...body,
      },
    });

    const { id, ...updateBody } = params;

    // ObjectId check
    if (!ObjectId.isValid(id)) {
      throw BadRequestError("Invalid course id format");
    }
    
    const updatedCourse = await updateCourse(id, updateBody);

    return successResponse(
      "Course updated successfully",
      updatedCourse
    );
  } catch (error: any) {
    console.error("Error updating course:", error);

    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal Server Error",
      error.statusCode ?? 500
    );
  }
};
