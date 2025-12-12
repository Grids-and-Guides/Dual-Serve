import { CourseDocument } from "../../../schema/courses.schema";
import { connectToDatabase } from "../../../shared/database";
import { NotFoundError } from "../../../shared/response";
import { ObjectId } from "mongodb";

export const getCourse = async (courseId: string): Promise<CourseDocument> => {
  try {
    const db = await connectToDatabase();
    const coursesCollection = db.collection<CourseDocument>("courses");

    const course = await coursesCollection.findOne({ _id: new ObjectId(courseId) });

    if (!course) {
      throw NotFoundError("Course not found");
    }

    return course;

  } catch (error) {
    console.error("Unexpected error in get course:", error);
    throw error;
  }
};
