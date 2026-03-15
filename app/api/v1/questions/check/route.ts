import db from "@/db";
import { answersTable, questionsTable } from "@/schema";
import { AnswerInsert, checkQuizInputSchema, CheckQuizOutput, checkQuizOutputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
  const user = await authenticate();
  if (!user) {
    return NextResponse.json({
      message: "You must be logged in to register for a course",
    }, { status: 401 });
  }
  const body: unknown = await request.json();
  const input = checkQuizInputSchema.parse(body);
  const questions = await db.query.questionsTable.findMany({
    where: eq(questionsTable.courseId, input.courseId),
    with: {
      options: true,
    }
  })
  for (const question of questions) {
    const answer = input.answers.find((answer) => answer.questionId === question.id)
    if (!answer) {
      return NextResponse.json({ message: `No answer provided for question ${question.id}` }, { status: 400 })
    }
    const option = question.options.find((option) => option.order === answer.selectedOptionOrder)
    if (!option) {
      return NextResponse.json({ message: `Invalid option selected for question ${question.id}` }, { status: 400 })
    }
  }
  const questionIds = questions.map((question) => question.id)
  await db.delete(answersTable).where(and(
    inArray(answersTable.questionId, questionIds),
    eq(answersTable.userId, user.id),
  ));
  const answerInserts = input.answers.map((answer) => {
    const question = questions.find((question) => question.id === answer.questionId)
    if (!question) {
      throw new Error("Question not found")
    }
    const option = question.options.find((option) => option.order === answer.selectedOptionOrder)
    if (!option) {
      throw new Error("Option not found")
    }
    const answerInsert: AnswerInsert = {
      questionId: answer.questionId,
      optionId: option.id,
      userId: user.id,
    }
    return answerInsert
  })
  db.insert(answersTable).values(answerInserts)
  const outputs = input.answers.map((answer) => {
    const question = questions.find((question) => question.id === answer.questionId)
    if (!question) {
      throw new Error("Question not found")
    }
    const correct = question.correctOptionOrder === answer.selectedOptionOrder
    const output = {
      correct,
      explanation: question.explanation,
    }
    return output
  })
  const outputData: CheckQuizOutput = {
    results: outputs,
  }
  const output = checkQuizOutputSchema.parse(outputData)
  return NextResponse.json(output)
}