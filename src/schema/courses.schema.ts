import { ObjectId } from "mongodb";

export interface CourseDocument {
  id: ObjectId;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
