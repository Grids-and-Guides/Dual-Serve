import { ListResponse } from "@/shared/global-types";
import { UserDocument } from "@/schema/users.schema";
import { connectToDatabase } from "@/shared/database";
import { NotFoundError } from "@/shared/response";

export interface UserData {
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllUsersResponse extends ListResponse {
  data: UserData[];
}

interface UserFilter {
  $or?: Array<{ [key: string]: any }>;
}

export const getUsersList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: string = "createdAt",
  sortOrder: string = "asc"
): Promise<GetAllUsersResponse> => {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<UserDocument>("users");

    if (!usersCollection) {
      throw NotFoundError("Users collection not found");
    }

    const skip = (page - 1) * limit;

    const filter: UserFilter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const sortObject: any = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const total = await usersCollection.countDocuments(filter);

    const users = await usersCollection
      .find(filter)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      totalCount: total,
      pageNumber: page,
      pageLimit: limit,
      totalPages: Math.ceil(total / limit),
      data: users,
    };
  } catch (error) {
    console.error("Unexpected error in get all users:", error);
    throw error;
  }
};
