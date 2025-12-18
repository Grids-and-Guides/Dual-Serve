import { z } from "zod";

export const getUserRequestSchema = z.object({
  id: z
    .string({ message: "User ID is required" })
    .min(1, { message: "User ID is required" }),
});

export type GetUserRequest =
  z.infer<typeof getUserRequestSchema>;
