import { z } from "zod";

export const getCoursesRequestSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = Number(val);
      return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = Number(val);
      if (Number.isNaN(parsed)) return 10;
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

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),
});

export type GetCoursesRequest =
  z.infer<typeof getCoursesRequestSchema>;
