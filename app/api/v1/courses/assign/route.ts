import db from "@/db";
import { assignedCoursesTable, coursesTable, moduleProgressesTable } from "@/schema";
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

  await db.insert(assignedCoursesTable).values({
    courseId: input.courseId,
    userId: user.id,
  });

  return NextResponse.json({
    message: "Course assigned and progress started",
    assignedCourse,
  });
}