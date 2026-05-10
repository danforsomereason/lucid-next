'use client'

import { CourseModulesContext, CourseModulesContextValue } from "@/context/courseModulesContext"
import { AssignedCourse, CheckQuestionInput, CheckQuestionOutput, CheckQuestionsInput, checkQuestionsInputSchema, checkQuestionsOutputSchema, EndModuleInput, endModuleInputSchema, endModuleOutputSchema, RelatedCourse, RelatedModule, SafeQuestion, SurveyAnswer, SurveyInput, surveyOutputSchema } from "@/types"
import areModulesCompleted from "@/utils/areModulesCompleted"
import axios from "axios"
import { useState } from "react"
import CourseModulesContent from "./CourseModulesContent"
import ModulesSidebarController from "./ModulesSidebarController"
import { MainContent, ModuleContainer } from "./styled"
import { SURVEY_QUESTIONS } from "@/constants"

interface CourseModulesProps {
  assignedCourse: AssignedCourse
  relatedCourse: RelatedCourse
  relatedModules: RelatedModule[]
  relatedQuestions: SafeQuestion[]
  savedResults: CheckQuestionOutput[]
  surveyAnswersProp: SurveyAnswer[]
}

export default function CourseModules({
  assignedCourse,
  relatedCourse,
  relatedModules,
  relatedQuestions,
  savedResults,
  surveyAnswersProp
}: CourseModulesProps) {
  const [assignment, setAssignment] = useState(assignedCourse)
  const [results, setResults] = useState<CheckQuestionOutput[]>(savedResults)
  const [modules, setModules] = useState(relatedModules)
  const modulesCompleted = areModulesCompleted(modules)
  console.log('modulesCompleted', modulesCompleted)
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(() => {
    if (modulesCompleted) {
      return undefined
    }
    return relatedModules[0].id
  })
  const quizCompleted = assignment.completedAt !== null
  console.log('quizCompleted', quizCompleted)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(() => {
    if (quizCompleted) {
      return undefined
    }
    if (modulesCompleted) {
      return relatedQuestions[0].id
    }
    return undefined
  })
  const [quizShown, setQuizShown] = useState(() => !quizCompleted && modulesCompleted)
  console.log('quizShown', quizShown)
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined)
  const [answers, setAnswers] = useState<CheckQuestionInput[]>([])
  const [surveyAnswer, setSurveyAnswer] = useState('')
  const [surveyAnswers, setSurveyAnswers] = useState(surveyAnswersProp)
  const [surveyShown, setSurveyShown] = useState(quizCompleted)
  const surveyCompleted = surveyAnswers.length === SURVEY_QUESTIONS.length
  const selectedModule = modules.find((module) => module.id === selectedModuleId)
  const selectedQuestion = relatedQuestions.find((question) => question.id === selectedQuestionId)
  const selectedOption = selectedQuestion?.options.find((option) => option.id === selectedOptionId)
  const onLastQuestion = selectedQuestion?.order === relatedQuestions.length - 1
  const correctAnswers = results.filter(result => result.correct)
  const score = Math.round((correctAnswers.length / results.length) * 100);
  function progressModule(modules: RelatedModule[]) {
    const modulesCompleted = areModulesCompleted(modules)
    if (modulesCompleted) {
      showQuiz()
      if (!quizCompleted) {
        setSelectedQuestionId(relatedQuestions[0].id)
      }
    }
  }
  async function completeModule() {
    if (!selectedModuleId) {
      throw new Error('No module selected')
    }
    if (!selectedModule) {
      throw new Error('Selected module not found')
    }
    if (selectedModule.moduleProgresses.length !== 1) {
      throw new Error('Invalid module progresses')
    }
    const moduleProgress = selectedModule.moduleProgresses[0]
    if (moduleProgress.endModule) {
      progressModule(modules)
      return
    }
    const body: EndModuleInput = { moduleId: selectedModuleId }
    const input = endModuleInputSchema.parse(body)
    const response = await axios.post("/api/v1/modules/end", body)
    const output = endModuleOutputSchema.parse(response.data)
    if (!output.endModule) {
      throw new Error("Failed to end module");
    }
    const newRelatedModules = modules.map((m) => {
      if (m.id !== selectedModuleId) {
        return m
      }
      const newModule = {
        ...m,
        moduleProgresses: [output],
      }
      return newModule
    })
    setModules(newRelatedModules)
    progressModule(newRelatedModules)
  }
  function selectModule(moduleId: string) {
    setSelectedModuleId(moduleId)
    setQuizShown(false)
    setSurveyShown(false)
    setSelectedQuestionId(undefined)
  }
  function selectOption(optionId: string) {
    setSelectedOptionId(optionId)
  }
  function showQuiz() {
    setQuizShown(true)
    setSurveyShown(false)
    setSelectedModuleId(undefined)
  }
  function showSurvey() {
    console.log('showing survey')
    setSurveyShown(true)
    setQuizShown(false)
    setSelectedModuleId(undefined)
  }
  async function checkQuiz(answers: CheckQuestionInput[]) {
    const inputData: CheckQuestionsInput = {
      answers,
      courseId: relatedCourse.id,
    }
    const input = checkQuestionsInputSchema.parse(inputData)
    const response = await axios.post("/api/v1/questions/check", input)
    const output = checkQuestionsOutputSchema.parse(response.data)
    setResults(output.results)

    if (output.passing) {
      const newAssignment = {
        ...assignment,
        completedAt: new Date(),
      }
      setAssignment(newAssignment)
    } else if (output.maximized) {
      const newModules = modules.map((module, index) => {
        if (index === 0) {
          const newModuleProgress = {
            ...module.moduleProgresses[0],
            endModule: null,
          }
          const newModule = {
            ...module,
            moduleProgresses: [newModuleProgress],
          }
          return newModule
        } else {
          const newModule = {
            ...module,
            moduleProgresses: [],
          }
          return newModule
        }
      })
      setModules(newModules)
      const newAssignment = {
        ...assignment,
        quizAttempts: 0
      }
      setAssignment(newAssignment)
    } else {
      const newAssignment = {
        ...assignment,
        quizAttempts: assignment.quizAttempts + 1,
      }
      setAssignment(newAssignment)
    }
  }
  async function advanceQuestion() {
    if (!selectedQuestion) {
      throw new Error("No question selected")
    }
    if (!selectedOption) {
      throw new Error("No option selected")
    }
    const newAnswer: CheckQuestionInput = {
      questionId: selectedQuestion.id,
      optionId: selectedOption.id,
    }
    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)
    if (onLastQuestion) {
      await checkQuiz(newAnswers)
      setSelectedQuestionId(undefined)
    } else {
      const nextQuestionOrder = selectedQuestion.order + 1
      const nextQuestion = relatedQuestions.find((question) => question.order === nextQuestionOrder)
      if (!nextQuestion) {
        throw new Error("Next question not found")
      }
      setSelectedQuestionId(nextQuestion.id)
    }
    setSelectedOptionId(undefined)
  }
  async function advanceSurvey() {
    if (surveyCompleted) {
      throw new Error("Survey completed")
    }
    if (surveyAnswer === '') {
      throw new Error("No survey answer selected")
    }
    const input: SurveyInput = {
      assignedCourseId: assignment.id,
      order: surveyAnswers.length,
      answer: surveyAnswer,
    }
    const surveyResponse = await axios.post("/api/v1/survey", input)
    const surveyOutput = surveyOutputSchema.parse(surveyResponse.data)
    setSurveyAnswers([...surveyAnswers, surveyOutput])
    const finishingSurvey = surveyAnswers.length === SURVEY_QUESTIONS.length - 1
    if (finishingSurvey) {
      const now = new Date()
      const newAssignment = {
        ...assignment,
        completedAt: now,
      }
      setAssignment(newAssignment)
    }
  }
  function selectSurveyAnswer(answer: string) {
    setSurveyAnswer(answer)
  }

  function retakeQuiz() {
    setAnswers([])
    setSelectedQuestionId(relatedQuestions[0].id)
  }
  function restart() {
    setAnswers([])
    selectModule(relatedModules[0].id)
  }
  const value: CourseModulesContextValue = {
    advanceQuestion,
    advanceSurvey,
    assignedCourse: assignment,
    completeModule,
    course: relatedCourse,
    modules,
    modulesCompleted,
    onLastQuestion,
    questions: relatedQuestions,
    quizCompleted,
    quizShown,
    restart,
    results,
    retakeQuiz,
    score,
    selectModule,
    selectOption,
    selectedModule,
    selectedModuleId,
    selectedOption,
    selectedOptionId,
    selectedQuestion,
    selectedQuestionId,
    selectSurveyAnswer,
    showQuiz,
    showSurvey,
    surveyAnswer,
    surveyAnswers,
    surveyCompleted,
    surveyShown,
  }
  return (
    <CourseModulesContext value={value}>
      <ModuleContainer>
        <ModulesSidebarController />
        <MainContent>
          <CourseModulesContent />
        </MainContent>
      </ModuleContainer>
    </CourseModulesContext>
  )
}