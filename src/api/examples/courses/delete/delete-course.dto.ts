import { z } from "zod";

export const deleteCourseRequestSchema = z.object({
  id: z.string({ message: "Course id is required" })
    .meta({ in: "path" })
});

export type DeleteCourseRequest = z.infer<
  typeof deleteCourseRequestSchema
>;
