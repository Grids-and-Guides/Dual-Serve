import { z } from "zod";

export const getListUsersRequestSchema = z.object({
  page: z.string().optional().meta({ in: "query" }),

  limit: z.string().optional().meta({ in: "query" }),

  search: z.string().optional().meta({ in: "query" }),

  sortBy: z
    .enum([
      "name",
      "lastName",
      "email",
      "mobileNumber",
      "age",
      "createdAt",
    ])
    .optional()
    .meta({ in: "query" }),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .meta({ in: "query" }),
});

export type GetListUsersRequest =
  z.infer<typeof getListUsersRequestSchema>;
