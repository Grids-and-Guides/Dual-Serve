import { z } from "zod";

export const updateUserPathSchema = z.object({
  id: z.string({ message: "User id is required" }),
});

export const updateUserBodySchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobileNumber: z.string().optional(),
  age: z.number().optional(),
});

export type UpdateUserPathRequest = z.infer<
  typeof updateUserPathSchema
>;

export type UpdateUserBodyRequest = z.infer<
  typeof updateUserBodySchema
>;
