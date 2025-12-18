import { z } from "zod";

export const updateCoursePathSchema = z.object({
  id: z
    .string({ message: "Course id is required" })
    .min(1, { message: "Course id is required" }),
});

export const updateCourseBodySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    duration: z.number().optional(),
    price: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export type UpdateCoursePathRequest =
  z.infer<typeof updateCoursePathSchema>;

export type UpdateCourseBodyRequest =
  z.infer<typeof updateCourseBodySchema>;
