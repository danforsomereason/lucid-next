import db from "@/db";
import { assignedCoursesTable } from "@/schema";
import { assignCourseInputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await authenticate();
  if (!user) {
    return NextResponse.json({
      message: "You must be logged in to register for a course",
    }, { status: 401 });
  }
  const body: unknown = await req.json();
  const input = assignCourseInputSchema.parse(body);

  const assignedCourse = await db.query.assignedCoursesTable.findFirst({
    where: and(
      eq(assignedCoursesTable.courseId, input.courseId),
      eq(assignedCoursesTable.userId, user.id)
    ),
  });
  if (assignedCourse) {
    return NextResponse.json({ message: "Course already assigned" });
  }

  const inserted = await db.insert(assignedCoursesTable).values({
    courseId: input.courseId,
    userId: user.id,
  });
  const course = await db.query.coursesTable.findFirst({
    where: eq(assignedCoursesTable.courseId, input.courseId),
    with: {
      modules: true,
    }
  })
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }


  // const firstModule = sortedModules[0];

  // if (!firstModule) {
  //   return res
  //     .status(404)
  //     .json({ message: "No modules found for this course" });
  // }

  // const existingProgress = await ModuleProgressModel.findOne({
  //   user_id: user.id,
  //   module_id: firstModule._id,
  // });

  // if (!existingProgress) {
  //   await ModuleProgressModel.create({
  //     course_id: new mongoose.Types.ObjectId(req.params.courseId),
  //     user_id: new mongoose.Types.ObjectId(user.id),
  //     module_id: firstModule._id,
  //     start_module: new Date(),
  //     end_module: null,
  //   });
  // }

  return NextResponse.json({
    message: "Course assigned and progress started",
    assignedCourse,
  });
}