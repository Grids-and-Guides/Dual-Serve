import { UserDocument } from "../../../../schema/users.schema";
import { connectToDatabase } from "../../../../shared/database";
import { NotFoundError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const getUser = async (userId: string): Promise<UserDocument> => {
    try {
        const db = await connectToDatabase();
        const usersCollection = db.collection<UserDocument>("users");

        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            throw NotFoundError("User not found");
        }

        return user;

    } catch (error) {
        console.error("Unexpected error in get user:", error);
        throw error;
    }
};
