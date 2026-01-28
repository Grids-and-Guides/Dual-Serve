import { z } from "zod";

/* ======================
   ENUMS
====================== */

export enum UserSortBy {
  NAME = "name",
  LAST_NAME = "lastName",
  EMAIL = "email",
  MOBILE_NUMBER = "mobileNumber",
  AGE = "age",
  CREATED_AT = "createdAt",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

/* ======================
   REQUEST SCHEMA
====================== */

export const getListUsersRequestSchema = z.object({
  page: z.coerce
    .number()
    .min(1)
    .default(1)
    .meta({ in: "query" }),

  limit: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(10)
    .meta({ in: "query" }),

  search: z
    .string()
    .optional()
    .meta({ in: "query" }),

  sortBy: z
    .nativeEnum(UserSortBy)
    .optional()
    .meta({ in: "query" }),

  sortOrder: z
    .nativeEnum(SortOrder)
    .optional()
    .meta({ in: "query" }),
});

/* ======================
   TYPE
====================== */

export type GetListUsersRequest = z.infer<
  typeof getListUsersRequestSchema
>;
