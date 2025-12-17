import { z } from "zod";

// Request DTO (query parameters)
export const getCoursesRequestSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val)) : 1)),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val) : 10;
      return Math.min(Math.max(1, parsed), 100);
    }),

  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined),

  sortBy: z
    .enum(["title", "duration", "price", "createdAt"])
    .optional()
    .default("createdAt"),

  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type GetCoursesRequest = z.infer<typeof getCoursesRequestSchema>;
