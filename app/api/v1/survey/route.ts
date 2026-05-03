import { SURVEY_QUESTIONS } from "@/constants";
import db from "@/db";
import { assignedCoursesTable, quizAnswersTable, surveyAnswersTable } from "@/schema";
import { surveyInputSchema, SurveyOutput } from "@/types";
import authenticate from "@/utils/authenticate";
import checkQuiz from "@/utils/checkQuiz";
import { generateCertificate } from "@/utils/generateCertificate";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import env from "@/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
});

export async function POST (request: Request) {
  console.log('survey route')
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
    with: {
      course: {
        with: {
          questions: {
            with: {
              quizAnswers: {
                where: eq(quizAnswersTable.userId, user.id),
              },
              options: true,
            }
          }
        }
      }
    }
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
    const name = `${user.firstName} ${user.lastName}`
    const answers = assignedCourse.course.questions.map((question) => {
      return question.quizAnswers[0]
    })
    const quizResult = checkQuiz({
      answers,
      questions: assignedCourse.course.questions
    })
    const pdfBuffer = await generateCertificate({
      userName: name,
      courseName: assignedCourse.course.title,
      ceHours: assignedCourse.course.ceHours,
      completionDate: now,
      score: quizResult.score
    })
    const base64 = pdfBuffer.toString('base64')
    const dataUrl = `data:application/pdf;base64,${base64}`
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'certificates',
      public_id: `${user.id}_${assignedCourse.courseId}`,
      resource_type: 'raw',
    })
    await db
      .update(assignedCoursesTable)
      .set({
        certificateUrl: uploadResult.secure_url,
        completedAt: now,
      })
      .where(assignedCourseCondition)
  }
  const output: SurveyOutput = answer
  return NextResponse.json(output);
}