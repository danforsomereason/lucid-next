import db from "@/db";
import { assignedCoursesTable, coursesTable, moduleProgressesTable, modulesTable } from "@/schema";
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

  const existingAssignedCourse = await db.query.assignedCoursesTable.findFirst({
    where: and(
      eq(assignedCoursesTable.courseId, input.courseId),
      eq(assignedCoursesTable.userId, user.id)
    ),
  });
  if (existingAssignedCourse) {
    return NextResponse.json({ message: "Course already assigned" });
  }

  const [assignedCourse] = await db.insert(assignedCoursesTable).values({
    courseId: input.courseId,
    userId: user.id,
  }).returning();
  if (!assignedCourse) {
    return NextResponse.json({ message: "Failed to assign course" }, { status: 500 });
  }
  const [module] = await db.query.modulesTable.findMany({
    where: eq(modulesTable.courseId, input.courseId),
    orderBy: (modulesTable, { desc }) => desc(modulesTable.order),
  });
  if (!module) {
    return NextResponse.json({ message: "Failed to find first module for course" }, { status: 500 });
  }
  await db.insert(moduleProgressesTable).values({
    assignedCourseId: assignedCourse.id,
    moduleId: module.id,
  });

  return NextResponse.json({
    message: "Course assigned and progress started",
    assignedCourse: assignedCourse,
  });
}