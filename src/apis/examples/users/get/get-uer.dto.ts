import { z } from "zod";

export const getUserRequestSchema = z.object({
  id: z
    .string({ message: "User ID is required" })
    .refine((val) => val.length > 0, {
      message: "User ID cannot be empty",
    }),
});

export type GetUserRequest = z.infer<typeof getUserRequestSchema>;
