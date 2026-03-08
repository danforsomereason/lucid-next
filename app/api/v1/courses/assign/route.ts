import db from "@/db";
import { assignedCoursesTable, coursesTable, moduleProgressTable } from "@/schema";
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
    where: eq(coursesTable.id, input.courseId),
    with: {
      modules: true,
    }
  })
  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  const sortedModules = course.modules.sort((a, b) => a.order - b.order);

  const firstModule = sortedModules[0];

  if (!firstModule) {
    return NextResponse.json({ message: "No modules found for this course" }, { status: 404 });
  }

  const existingProgress = await db.query.moduleProgressTable.findFirst({
    where: and(
      eq(moduleProgressTable.moduleId, firstModule.id),
      eq(moduleProgressTable.userId, user.id),
    )
  });

  if (!existingProgress) {
    await db.insert(moduleProgressTable).values({
      moduleId: firstModule.id,
      userId: user.id,
    })
  }

  return NextResponse.json({
    message: "Course assigned and progress started",
    assignedCourse,
  });
}