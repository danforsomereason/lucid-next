import db from "@/db";
import { coursesTable, modulesTable, optionsTable, questionsTable } from "@/schema";
import { createCourseInputSchema, createCourseOutputSchema, ModuleInsert, OptionInsert, QuestionInsert } from "@/types";
import authenticate from "@/utils/authenticate";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
  const user = await authenticate()
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }
  if (user.role !== 'instructor' && user.role !== 'super_admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const body: unknown = await request.json()
  const input = createCourseInputSchema.parse(body)
  const invalidQuestions = input.questions.filter(question => {
    const set = new Set(question.options)
    return set.size !== question.options.length
  })
  if (invalidQuestions.length > 0) {
    return NextResponse.json({ message: 'Each question must have unique options' }, { status: 400 })
  }
  const [course] = await db.insert(coursesTable).values({
    title: input.title,
    description: input.description,
    ceHours: input.ceHours,
    instructorId: user.id,
    premium: false
  }).returning()
  const moduleInserts = input.modules.map((def, index) => {
    const insert: ModuleInsert = {
      ...def,
      courseId: course.id,
      order: index
    }
    return insert
  })
  await db.insert(modulesTable).values(moduleInserts)
  const questionInserts = input.questions.map((def, index) => {
    const insert: QuestionInsert = {
      ...def,
      courseId: course.id,
      order: index
    }
    return insert
  })
  const questions = await db.insert(questionsTable).values(questionInserts).returning()

  const optionInserts = input.questions.flatMap((questionDef, questionIndex) => {
    const question = questions[questionIndex]
    return questionDef.options.map((option, index) => {
      const optionInsert: OptionInsert = {
        option,
        order: index,
        questionId: question.id
      }
      return optionInsert
    })
  })
  await db.insert(optionsTable).values(optionInserts)

  const output = createCourseOutputSchema.parse(course)
  return NextResponse.json(output)
}