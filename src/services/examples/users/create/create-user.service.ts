// src/services/user/create-user-service.ts
import { InsertOneResult } from "mongodb";
import { UserDocument } from "../../../../schema/users.schema";
import { connectToDatabase } from "../../../../shared/database";
import { ConflictError } from "../../../../shared/response";

export interface CreateUserInput {
  name: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  age?: number;
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  const db = await connectToDatabase();
  return db.collection<UserDocument>("users").findOne({ email: email.trim() });
}

export async function createUserInDB(newUser: CreateUserInput): Promise<UserDocument> {
  const db = await connectToDatabase();

  const userWithTimestamps = {
    ...newUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result: InsertOneResult<UserDocument> = await db
    .collection<UserDocument>("users")
    .insertOne(userWithTimestamps as any);

  return { ...userWithTimestamps, _id: result.insertedId };
}

export const createUser = async (userData: CreateUserInput): Promise<{ userId: string }> => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw ConflictError("User with this email already exists");
  }

  const createdUser = await createUserInDB(userData);
  return { userId: createdUser._id.toHexString() };
};
