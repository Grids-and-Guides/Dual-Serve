import { z } from "zod";

export const deleteUserRequestSchema = z.object({
  id: z.string({ message: "User id is required" }),
});

export type DeleteUserRequest = z.infer<
  typeof deleteUserRequestSchema
>;
