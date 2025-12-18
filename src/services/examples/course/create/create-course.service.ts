import { InsertOneResult } from "mongodb";
import { connectToDatabase } from "../../../../shared/database";
import { ConflictError } from "../../../../shared/response";
import { CourseDocument } from "../../../../schema/courses.schema";

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  price: number;
}

export async function findCourseByTitle(title: string): Promise<CourseDocument | null> {
  const db = await connectToDatabase();
  return db.collection<CourseDocument>("courses").findOne({ title: title.trim() });
}

export async function createCourseInDB(newCourse: CreateCourseInput): Promise<CourseDocument> {
  const db = await connectToDatabase();

  const courseWithTimestamps = {
    ...newCourse,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result: InsertOneResult<CourseDocument> = await db
    .collection<CourseDocument>("courses")
    .insertOne(courseWithTimestamps as any);

  return { ...courseWithTimestamps, id: result.insertedId };
}

export const createCourse = async (
  courseData: CreateCourseInput
): Promise<{ courseId: string }> => {
  const existingCourse = await findCourseByTitle(courseData.title);
  if (existingCourse) {
    throw ConflictError("Course with this title already exists");
  }

  const createdCourse = await createCourseInDB(courseData);
  return { courseId: createdCourse.id.toHexString() };
};
