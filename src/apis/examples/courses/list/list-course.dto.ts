import { z } from "zod";

export enum CourseSortBy {
  TITLE = "title",
  DURATION = "duration",
  PRICE = "price",
  CREATED_AT = "createdAt",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const getCoursesRequestSchema = z.object({
  page: z
    .number()
    .optional()
    .default(1)
    .meta({ in: "query" }),

  limit: z
    .number()
    .optional()
    .default(10)
    .meta({ in: "query" }),

  search: z
    .string()
    .optional()
    .meta({ in: "query" }),

  sortBy: z
    .enum(CourseSortBy)
    .optional()
    .meta({ in: "query" }),

  sortOrder: z
    .enum(SortOrder)
    .optional()
    .meta({ in: "query" }),
});


export type GetCoursesRequest =
  z.infer<typeof getCoursesRequestSchema>;
