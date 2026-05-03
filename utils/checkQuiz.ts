import { CheckQuestionInput, CheckQuestionOutput, RelatedQuestion } from "@/types"

export default function checkQuiz (props: {
  answers: CheckQuestionInput[]
  questions: RelatedQuestion[]
}) {
  const results = props.answers.map((answer) => {
    const question = props.questions.find((question) => question.id === answer.questionId)
    if (!question) {
      throw new Error("Question not found")
    }
    const correctOption = question.options[question.correctOptionOrder]
    if (!correctOption) {
      throw new Error("Correct option not found")
    }
    const correct = correctOption.id === answer.optionId
    const output: CheckQuestionOutput = {
      correct,
      correctAnswer: correctOption.option,
      explanation: question.explanation,
    }
    return output
  })
  const correctOutputs = results.filter((output) => output.correct)
  const score = (correctOutputs.length / props.questions.length) * 100
  return { score, results }
}