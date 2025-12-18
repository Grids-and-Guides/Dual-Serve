import { z } from "zod";

export const deleteCourseRequestSchema = z.object({
  id: z.string({ message: "Course id is required" }),
});

export type DeleteCourseRequest = z.infer<
  typeof deleteCourseRequestSchema
>;
    