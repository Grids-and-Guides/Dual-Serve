import { z } from "zod";

export const createCourseRequestSchema = z.object({
  title: z
    .string({ message: "Course title is required" })
    .min(1, { message: "Course title is required" }),

  description: z
    .string({ message: "Course description is required" })
    .min(10, { message: "Description must be at least 10 characters" }),

  thumbnail: z
    .string({ message: "Thumbnail is required" })
    .min(1, { message: "Thumbnail is required" }),

  duration: z
    .number({ message: "Duration is required" })
    .gt(0, { message: "Duration must be greater than 0" }),

  price: z
    .number({ message: "Price is required" })
    .min(0, { message: "Price must be zero or more" }),
});

export type CreateCourseRequest =
  z.infer<typeof createCourseRequestSchema>;
