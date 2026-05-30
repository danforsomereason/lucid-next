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
  console.log('input.courseId', input.courseId)
  const modules = await db.query.modulesTable.findMany({
    where: eq(modulesTable.courseId, input.courseId),
  });
  console.log('modules', modules)
  const sortedModules = modules.toSorted((a, b) => a.order - b.order)
  const firstModule = sortedModules[0]
  if (!firstModule) {
    return NextResponse.json({
      message: "Course has no modules",
    }, { status: 500 });
  }

  const [assignedCourse] = await db.insert(assignedCoursesTable).values({
    courseId: input.courseId,
    userId: user.id,
  }).returning();

  const existingProgress = await db.query.moduleProgressesTable.findFirst({
    where: and(
      eq(moduleProgressesTable.assignedCourseId, assignedCourse.id),
      eq(moduleProgressesTable.moduleId, firstModule.id)
    )
  });

  if (existingProgress) {
    return NextResponse.json({
      message: "Orphan progress",
    }, { status: 500 });
  }
  await db.insert(moduleProgressesTable).values({
    assignedCourseId: assignedCourse.id,
    moduleId: firstModule.id,
  });

  return NextResponse.json({
    message: "Course assigned and progress started",
    assignedCourse: existingAssignedCourse,
  });
}