import { z } from "zod";

export const createUserRequestSchema = z.object({
  name: z
    .string({ message: "First name is required" })
    .min(1, { message: "First name is required" }),

  lastName: z
    .string({ message: "Last name is required" })
    .min(1, { message: "Last name is required" }),

  email: z
    .string({ message: "Email is required" })
    .email("Invalid email"),

  mobileNumber: z
    .string({ message: "Mobile number is required" })
    .min(1, { message: "Mobile number is required" }),

  age: z
    .number({ message: "Age is required" })
    .int({ message: "Age must be a number" })
    .positive({ message: "Age must be greater than 0" }),
});

export type CreateUserRequest =
  z.infer<typeof createUserRequestSchema>;
