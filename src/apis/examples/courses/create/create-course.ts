import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { successResponse, errorResponse, BadRequestError } from "../../../../shared/response";
import { createCourse, CreateCourseInput } from "../../../../services/examples/course/create/create-course.service";
import { createCourseRequestSchema } from "./create-course.dto";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      throw BadRequestError("Request body is required");
    }

    const courseData: CreateCourseInput = createCourseRequestSchema.parse(
      typeof event.body === "string" ? JSON.parse(event.body) : event.body
    );

    const result = await createCourse(courseData);
    return successResponse("Course created successfully", result);

  } catch (error: any) {
    console.error("Error creating course:", error);
    return errorResponse(
      error.message ?? null,
      error.type ?? "Internal server error",
      error.statusCode ?? 500
    );
  }
};
