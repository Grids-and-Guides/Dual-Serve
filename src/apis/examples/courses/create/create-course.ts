import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  successResponse,
  errorResponse,
  BadRequestError,
} from "../../../../shared/response";
import { createCourse } from "../../../../services/examples/course/create/create-course.service";
import { createCourseRequestSchema, CreateCourseRequest } from "./create-course.dto";
import { validateRequest } from "../../../../shared/validation";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log("Received event:", JSON.stringify(event));
    // Parse body
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body || Object.keys(body).length === 0) {
      throw BadRequestError("Request body is required");
    }

    // Validate request
    const request = validateRequest<CreateCourseRequest>({
      schema: createCourseRequestSchema,
      data: body,
    });

    const result = await createCourse(request);

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
