import { ObjectId } from "mongodb";
import { connectToDatabase } from "../../../shared/database";
import { NotFoundError } from "../../../shared/response";
import { CourseDocument } from './../../../schema/courses.schema';

export const deleteCourse = async (
  courseId: string
): Promise<boolean> => {
  try {
    const db = await connectToDatabase();
    const coursesCollection = db.collection<CourseDocument>("courses");

    // Check if course exists
    const existingCourse = await coursesCollection.findOne({
      _id: new ObjectId(courseId),
    });
    if (!existingCourse) {
      throw NotFoundError("Course not found");
    }

    const result = await coursesCollection.deleteOne({
      _id: new ObjectId(courseId),
    });

    if (result.deletedCount === 0) {
      throw NotFoundError("Delete failed");
    }

    return true;

  } catch (error) {
    console.error("Unexpected error in deleteCourseService:", error);
    throw error;
  }
};
