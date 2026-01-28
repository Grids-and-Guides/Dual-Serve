import { UpdateUserRequest } from "@/apis/examples/users/update/update-user.dto";
import { UserDocument } from "../../../../schema/users.schema";
import { connectToDatabase } from "../../../../shared/database";
import { NotFoundError, BadRequestError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

type UpdateBody = Omit<UpdateUserRequest, "id">;

export const updateUser = async (
  userId: string,
  data: UpdateBody
): Promise<UserDocument> => {
  try {
    // Validate userId
    if (!ObjectId.isValid(userId)) {
      throw BadRequestError("Invalid user id");
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");

    // Whitelist fields only
    const updateData: Partial<UserDocument> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.mobileNumber !== undefined) updateData.mobileNumber = data.mobileNumber;
    if (data.age !== undefined) updateData.age = data.age;

    // No fields to update
    if (Object.keys(updateData).length === 1) {
      throw BadRequestError("No valid fields to update");
    }

    // Check user exists
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
