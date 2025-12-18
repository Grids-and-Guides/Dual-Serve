import { z } from "zod";

export const getCoursesRequestSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = Number(val);
      return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
    })
    .meta({ in: "query" }),

  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = Number(val);
      if (Number.isNaN(parsed)) return 10;
      return Math.min(Math.max(1, parsed), 100);
    })
    .meta({ in: "query" }),

  search: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .meta({ in: "query" }),

  sortBy: z
    .enum(["title", "duration", "price", "createdAt"])
    .optional()
    .default("createdAt")
    .meta({ in: "query" }),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc")
    .meta({ in: "query" })
});

export type GetCoursesRequest =
  z.infer<typeof getCoursesRequestSchema>;
