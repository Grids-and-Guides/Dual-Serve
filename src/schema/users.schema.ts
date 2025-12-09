import { ObjectId } from "mongodb";

export interface UserDocument {
  _id: ObjectId;
  name: string;
  lastName: string;
  email: string;
  mobileNumber?: string;
  age?: number;
  createdAt: Date;
  updatedAt: Date;
}
