import db from "@/db";
import { assignedCoursesTable, surveyAnswersTable } from "@/schema";
import { SURVEY_QUESTIONS, surveyInputSchema, SurveyOutput } from "@/types";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";
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
  const assignedCourseCondition = eq(assignedCoursesTable.id, input.assignedCourseId)
  const assignedCourse = await db.query.assignedCoursesTable.findFirst({
    where: assignedCourseCondition,
  })
  if (!assignedCourse) {
    return NextResponse.json({
      message: "Course assignment missing",
    }, { status: 404 })
  }
  if (assignedCourse.userId !== user.id) {
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
  const completed = input.order === SURVEY_QUESTIONS.length - 1
  if (completed) {
    const now = new Date()
    await db
      .update(assignedCoursesTable)
      .set({
        completedAt: now,
      })
      .where(assignedCourseCondition)
    return NextResponse.json({
      ...answer,
    } satisfies SurveyOutput)
  }
  return NextResponse.json(answer satisfies SurveyOutput);
}