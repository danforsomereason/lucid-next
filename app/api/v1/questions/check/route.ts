import db from "@/db";
import { quizAnswersTable, assignedCoursesTable, coursesTable, moduleProgressesTable } from "@/schema";
import { 
  QuizAnswerInsert,
  checkQuestionsInputSchema,
  CheckQuestionsOutput,
  checkQuestionsOutputSchema,
  CheckQuestionOutput
} from "@/types";
import authenticate from "@/utils/authenticate";
import checkQuiz from "@/utils/checkQuiz";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await authenticate();
  if (!user) {
    return NextResponse.json({
      message: "You must be logged in to answer a question",
    }, { status: 401 });
  }
  const body: unknown = await request.json();
  const input = checkQuestionsInputSchema.parse(body);
  const assignedCourse = await db.query.assignedCoursesTable.findFirst({
    where: eq(assignedCoursesTable.userId, user.id),
  })
  if (!assignedCourse) {
    return NextResponse.json({
      message: "You are not assigned to this course",
    }, { status: 403 })
  }
  const course = await db.query.coursesTable.findFirst({
    where: eq(coursesTable.id, input.courseId),
    with: {
      assignedCourses: {
        where: eq(assignedCoursesTable.userId, user.id),
      },
      modules: {
        with: {
          moduleProgresses: {
            where: eq(moduleProgressesTable.assignedCourseId, assignedCourse.id),
          }
        }
      },
      questions: {
        with: {
          options: true,
        }
      }
    }
  })
  if (!course) {
    return NextResponse.json({
      message: "Course not found",
    }, { status: 404 })
  }
  if (course.assignedCourses.length === 0) {
    return NextResponse.json({
      message: "You are not assigned to this course",
    }, { status: 403 })
  }
  for (const module of course.modules) {
    if (module.moduleProgresses.length === 0) {
      return NextResponse.json({
        message: `You have not begun module ${module.id}`
      }, { status: 400 })
    }
    if (module.moduleProgresses[0].endModule == null) {
      return NextResponse.json({
        message: `You have not completed module ${module.id}`
      }, { status: 400 })
    }
  }
  for (const question of course.questions) {
    const answer = input.answers.find((answer) => answer.questionId === question.id)
    if (!answer) {
      return NextResponse.json({
        message: `No answer provided for question ${question.id}`
      }, { status: 400 })
    }
    const option = question.options.find(
      (option) => option.id === answer.optionId
    )
    if (!option) {
      return NextResponse.json({
        message: `Invalid option selected for question ${question.id}`
      }, { status: 400 })
    }
  }
  const questionIds = course.questions.map((question) => question.id)
  await db.delete(quizAnswersTable).where(and(
    inArray(quizAnswersTable.questionId, questionIds),
    eq(quizAnswersTable.assignedCourseId, assignedCourse.id),
  ));
  const answerInserts = input.answers.map((answer) => {
    const question = course.questions.find((question) => question.id === answer.questionId)
    if (!question) {
      throw new Error("Question not found")
    }
    const option = question.options.find((option) => option.id === answer.optionId)
    if (!option) {
      throw new Error("Option not found")
    }
    const answerInsert: QuizAnswerInsert = {
      questionId: answer.questionId,
      optionId: option.id,
      assignedCourseId: assignedCourse.id,
    }
    return answerInsert
  })
  await db.insert(quizAnswersTable).values(answerInserts)
  const result = checkQuiz({
    answers: input.answers,
    questions: course.questions,
  })
  const passing = result.score >= course.passingScore
  const newAttempts = course.assignedCourses[0].quizAttempts + 1
  const maximized = newAttempts >= course.maximumAttempts
  const assignedCourseCondition = and(
    eq(assignedCoursesTable.courseId, course.id),
    eq(assignedCoursesTable.userId, user.id),
  )
  if (passing) {
    await db.update(assignedCoursesTable).set({
      completedAt: new Date(),
      quizAttempts: newAttempts,
    }).where(assignedCourseCondition)
  } else if (maximized) {
    await db.update(assignedCoursesTable).set({
      quizAttempts: 0
    }).where(assignedCourseCondition)
    const [first, ...restModules] = course.modules
    await db.update(moduleProgressesTable).set({
      endModule: null
    }).where(
      and(
        eq(moduleProgressesTable.moduleId, first.id),
        eq(moduleProgressesTable.assignedCourseId, assignedCourse.id)
      )
    )
    const restModuleIds = restModules.map((module) => module.id)
    await db.delete(moduleProgressesTable).where(
      and(
        eq(moduleProgressesTable.assignedCourseId, assignedCourse.id),
        inArray(moduleProgressesTable.moduleId, restModuleIds)
      )
    )
  } else {
    await db.update(assignedCoursesTable).set({
      quizAttempts: newAttempts
    }).where(assignedCourseCondition)
  }
  const outputData: CheckQuestionsOutput = {
    maximized,
    passing,
    results: result.results,
  }
  const output = checkQuestionsOutputSchema.parse(outputData)
  return NextResponse.json(output)
}