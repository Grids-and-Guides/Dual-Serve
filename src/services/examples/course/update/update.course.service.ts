import { CourseDocument } from "../../../../schema/courses.schema";
import { connectToDatabase } from "../../../../shared/database";
import { NotFoundError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

export const updateCourse = async (
  courseId: string,
  data: Partial<CourseDocument>
): Promise<CourseDocument> => {
  try {
    const db = await connectToDatabase();
    const coursesCollection = db.collection<CourseDocument>("courses");

    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    // Check if course exists
    const existingCourse = await coursesCollection.findOne({
      _id: new ObjectId(courseId),
    });
    if (!existingCourse) {
      throw NotFoundError("Course not found");
    }

    const result = await coursesCollection.findOneAndUpdate(
      { _id: new ObjectId(courseId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) {
      throw NotFoundError("Update failed");
    }

    return result;

  } catch (error) {
    console.error("Unexpected error in update course:", error);
    throw error;
  }
};
