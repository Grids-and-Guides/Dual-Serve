import { z } from "zod";

export const getCoursesRequestSchema = z.object({
  page: z
    .number() 
    .meta({ in: "query" }),

  limit: z
    .number()
    .optional()
    .meta({ in: "query" }),

  search: z
    .string()
    .meta({ in: "query" }),

  sortBy: z
    .enum(["title", "duration", "price", "createdAt"])
    .optional()
    .meta({ in: "query" }),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .meta({ in: "query" }),
});

export type GetCoursesRequest =
  z.infer<typeof getCoursesRequestSchema>;
