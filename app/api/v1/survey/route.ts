import db from "@/db";
import { assignedCoursesTable, surveyAnswersTable } from "@/schema";
import { SurveyInput, surveyInputSchema, SurveyOutput } from "@/types";
import authenticate from "@/utils/authenticate";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
  const user = await authenticate();
  if (!user) {
    return NextResponse.json({
      message: "You must be logged in to answer a survey",
    }, { status: 401 });
  }
  const body: unknown = await request.json();
  // Parse the request body with a Zod schema
  // If the body doesn't match the schema, Zod will throw an error
  const input = surveyInputSchema.parse(body);
  const assignedCourse = await db.query.assignedCoursesTable.findFirst({
    where: eq(assignedCoursesTable.courseId, input.assignedCourseId),
  })
  if (!assignedCourse) {
    return NextResponse.json({
      message: "You are not assigned to this course",
    }, { status: 403 })
  }
  const existingAnswers = await db.query.surveyAnswersTable.findMany({
    where: eq(surveyAnswersTable.assignedCourseId, assignedCourse.id),
  });
  if (existingAnswers.length < input.order) {
    return NextResponse.json({
      message: "You have not gotten to this question yet",
    }, { status: 400 })
  }
  if (existingAnswers.length > input.order) {
    return NextResponse.json({
      message: "You have already answered this question",
    }, { status: 400 })
  }
  const [answer] = await db.insert(surveyAnswersTable).values({
    assignedCourseId: assignedCourse.id,
    order: input.order,
    answer: input.answer
  }).returning()
  const output: SurveyOutput = answer
  return NextResponse.json(output);
}