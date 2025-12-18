import { z } from "zod";

export const updateCourseSchema = z
  .object({
    id: z
      .string({ message: "Course id is required" })
      .min(1, { message: "Course id is required" })
      .meta({ in: "path" }),

    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    duration: z.number().optional(),
    price: z.number().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.thumbnail !== undefined ||
      data.duration !== undefined ||
      data.price !== undefined,
    {
      message: "At least one field is required to update",
    }
  );

export type UpdateCourseRequest = z.infer<typeof updateCourseSchema>;
