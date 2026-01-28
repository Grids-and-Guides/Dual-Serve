import { z } from "zod";

export const deleteUserRequestSchema = z.object({
  id: z
    .string({ message: "User id is required" })
    .min(1, { message: "User id is required" })
    .meta({ in: "path" })
});

export type DeleteUserRequest =
  z.infer<typeof deleteUserRequestSchema>;
