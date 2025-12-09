import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../../shared/database";
import { UserDocument } from "../../../schema/users.schema";
import { NotFoundError } from "../../../shared/response";

export const deleteUser = async (
  userId: string
): Promise<boolean> => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!existingUser) {
      throw NotFoundError("User not found");
    }

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw NotFoundError("Delete failed");
    }

    return true;

  } catch (error) {
    console.error("Unexpected error in deleteUserService:", error);
    throw error;
  }
};
