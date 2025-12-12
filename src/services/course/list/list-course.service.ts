import { CourseDocument } from "../../../schema/courses.schema";
import { connectToDatabase } from "../../../shared/database";
import { NotFoundError } from "../../../shared/response";

export interface CourseData {
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetAllCoursesResponse {
  totalCount: number;
  pageNumber: number;
  pageLimit: number;
  totalPages: number;
  data: CourseData[];
}

interface CourseFilter {
  $or?: Array<{ [key: string]: any }>;
}

export const getCoursesList = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: string = "createdAt",
  sortOrder: string = "asc"
): Promise<GetAllCoursesResponse> => {
  try {
    const db = await connectToDatabase();
    const coursesCollection = db.collection<CourseDocument>("courses");

    if (!coursesCollection) {
      throw NotFoundError("Courses collection not found");
    }

    const skip = (page - 1) * limit;

    const filter: CourseFilter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const sortObject: any = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const total = await coursesCollection.countDocuments(filter);

    const courses = await coursesCollection
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
      data: courses,
    };
  } catch (error) {
    console.error("Unexpected error in get all courses:", error);
    throw error;
  }
};
