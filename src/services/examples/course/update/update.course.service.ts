import { UpdateCourseRequest } from "@/apis/examples/courses/update/update-course.dto";
import { CourseDocument } from "../../../../schema/courses.schema";
import { connectToDatabase } from "../../../../shared/database";
import { BadRequestError, NotFoundError } from "../../../../shared/response";
import { ObjectId } from "mongodb";

type UpdateBody = Omit<UpdateCourseRequest, "id">;

export const updateCourse = async (
  courseId: string,
  updateBody: UpdateBody
) => {

  try {
    const db = await connectToDatabase();
    const coursesCollection = db.collection<CourseDocument>("courses");

    if (!ObjectId.isValid(courseId)) {
      throw BadRequestError("Invalid course id");
    }

    const _id = new ObjectId(courseId);

    // Check exists
    const existingCourse = await coursesCollection.findOne({ _id });

    if (!existingCourse) {
      throw NotFoundError("Course not found");
    }

    const result = await coursesCollection.findOneAndUpdate(
      { _id },
      {
        $set: {
          ...updateBody,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      throw NotFoundError("Update failed");
    }

    return result;
  }
  catch (error) {
    console.error("Unexpected error in update course:", error);
    throw error;
  }
}

