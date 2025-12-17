import { z } from "zod";

export const createCourseRequestSchema = z.object({
  title: z.string({ required_error: "Course title is required" }),

  description: z
    .string({ required_error: "Course description is required" })
    .min(10, "Description must be at least 10 characters"),

  thumbnail: z.string({ required_error: "Thumbnail is required" }),

  duration: z
    .number({ required_error: "Duration is required" })
    .min(1, "Duration must be greater than 0"),

  price: z
    .number({ required_error: "Price is required" })
    .nonnegative("Price must be a positive number"),
});

export type CreateCourseRequest = z.infer<typeof createCourseRequestSchema>;
