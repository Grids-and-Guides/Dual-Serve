import { z } from "zod";

export const getCourseRequestSchema = z.object({
  id: z.string({ message: "Course ID is required" }),
});

export type GetCourseRequest = z.infer<
  typeof getCourseRequestSchema
>;
