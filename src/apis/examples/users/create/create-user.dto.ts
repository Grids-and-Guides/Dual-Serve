// src/apis/example/users/create/create-user.dto.ts
import { z } from "zod";

export const createUserRequestSchema = z.object({
  name: z.string({ required_error: "First name is required" }),
  lastName: z.string({ required_error: "Last name is required" }),
  email: z.string({ required_error: "Email is required" }).email("Invalid email"),
  mobileNumber: z.string({ required_error: "Mobile number is required" }),
  age: z.number({ required_error: "Age is required" }),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
