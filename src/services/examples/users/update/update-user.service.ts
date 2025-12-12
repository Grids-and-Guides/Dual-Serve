import { UserDocument } from "../../../../schema/users.schema";
import { connectToDatabase } from "../../../../shared/database";
import { NotFoundError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const updateUser = async (
  userId: string,
  data: Partial<UserDocument>
): Promise<UserDocument> => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    // Check if user exists
    const existingUser = await usersCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!existingUser) {
      throw NotFoundError("User not found");
    }

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      throw NotFoundError("Update failed");
    }

    return result;

  } catch (error) {
    console.error("Unexpected error in update user:", error);
    throw error;
  }
};
