import { z } from "zod";

export const createUserRequestSchema = z.object({
  name: z.string({ message: "First name is required" }),
  lastName: z.string({ message: "Last name is required" }),
  email: z.string({ message: "Email is required" }).email("Invalid email"),
  mobileNumber: z.string({ message: "Mobile number is required" }),
  age: z.number({ message: "Age is required" }),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
