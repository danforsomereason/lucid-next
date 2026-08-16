'use client'

import CourseModulesContext from "@/context/CourseModulesContext"
import { AssignedCourse, CheckQuestionInput, CheckQuestionOutput, CheckQuestionsInput, checkQuestionsInputSchema, checkQuestionsOutputSchema, CourseModulesContextValue, EndModuleInput, endModuleInputSchema, endModuleOutputSchema, Module, ModuleProgress, RelatedCourse, SafeQuestion, SURVEY_QUESTIONS, SurveyAnswer, SurveyInput, surveyOutputSchema } from "@/types"
import areModulesCompleted from "@/utils/areModulesCompleted"
import axios from "axios"
import { useState } from "react"
import CourseModulesContent from "./CourseModulesContent"
import ModulesSidebarController from "./ModulesSidebarController"
import { MainContent, ModuleContainer } from "./styled"

export default function CourseModules(props: {
  assignedCourse: AssignedCourse
  relatedCourse: RelatedCourse
  modules: Module[]
  relatedQuestions: SafeQuestion[]
  moduleProgresses: ModuleProgress[]
  savedResults: CheckQuestionOutput[]
  surveyAnswers: SurveyAnswer[]
}) {
  console.log('props.moduleProgresses', props.moduleProgresses)
  const [assignment, setAssignment] = useState(props.assignedCourse)
  const [results, setResults] = useState<CheckQuestionOutput[]>(props.savedResults)
  const [modules] = useState(props.modules)
  const [moduleProgresses, setModuleProgresses] = useState(props.moduleProgresses)
  const modulesCompleted = areModulesCompleted(modules, moduleProgresses)
  console.log('modulesCompleted', modulesCompleted)
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(() => {
    if (modulesCompleted) {
      return undefined
    }
    return props.modules[0].id
  })
  const quizCompleted = assignment.completedAt !== null
  console.log('quizCompleted', quizCompleted)
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(() => {
    if (quizCompleted) {
      return undefined
    }
    if (modulesCompleted) {
      return props.relatedQuestions[0].id
    }
    return undefined
  })
  const [quizShown, setQuizShown] = useState(() => !quizCompleted && modulesCompleted)
  console.log('quizShown', quizShown)
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined)
  const [answers, setAnswers] = useState<CheckQuestionInput[]>([])
  const [surveyAnswer, setSurveyAnswer] = useState('')
  const [surveyAnswers, setSurveyAnswers] = useState(props.surveyAnswers)
  const [surveyShown, setSurveyShown] = useState(quizCompleted)
  const surveyCompleted = surveyAnswers.length === SURVEY_QUESTIONS.length
  const selectedModule = modules.find((module) => module.id === selectedModuleId)
  const selectedQuestion = props.relatedQuestions.find((question) => question.id === selectedQuestionId)
  const selectedOption = selectedQuestion?.options.find((option) => option.id === selectedOptionId)
  const onLastQuestion = selectedQuestion?.order === props.relatedQuestions.length - 1
  const correctAnswers = results.filter(result => result.correct)
  const score = Math.round((correctAnswers.length / results.length) * 100);
  function progressModule(
    modules: Module[],
    moduleProgresses: ModuleProgress[]
  ) {
    const modulesCompleted = areModulesCompleted(modules, moduleProgresses)
    if (modulesCompleted) {
      showQuiz()
      if (!quizCompleted) {
        setSelectedQuestionId(props.relatedQuestions[0].id)
      }
    }
  }
  async function completeModule() {
    console.log
    if (!selectedModuleId) {
      throw new Error('No module selected')
    }
    if (!selectedModule) {
      throw new Error('Selected module not found')
    }
    const moduleProgress = moduleProgresses.find((m) => m.moduleId === selectedModuleId)
    if (!moduleProgress) {
      throw new Error('Module progress not found')
    }
    if (moduleProgress.endModule) {
      progressModule(modules, moduleProgresses)
      return
    }
    const body: EndModuleInput = { moduleId: selectedModuleId }
    const input = endModuleInputSchema.parse(body)
    const response = await axios.post("/api/v1/modules/end", input)
    const output = endModuleOutputSchema.parse(response.data)
    if (!output.endModule) {
      throw new Error("Failed to end module");
    }
    const newModuleProgresses = moduleProgresses.map((moduleProgress) => {
      if (moduleProgress.moduleId !== selectedModuleId) {
        return moduleProgress
      }
      return {
        ...moduleProgress,
        endModule: output.endModule,
      }
    })
    setModuleProgresses(newModuleProgresses)
    progressModule(modules, newModuleProgresses)
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
      courseId: props.relatedCourse.id,
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
      const newModuleProgress: ModuleProgress = {
        ...moduleProgresses[0],
        endModule: null,
      }
      const newModuleProgresses = [newModuleProgress]
      setModuleProgresses(newModuleProgresses)
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
      const nextQuestion = props.relatedQuestions.find((question) => question.order === nextQuestionOrder)
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
    setSelectedQuestionId(props.relatedQuestions[0].id)
  }
  function restart() {
    setAnswers([])
    selectModule(props.modules[0].id)
  }
  const value: CourseModulesContextValue = {
    advanceQuestion,
    advanceSurvey,
    assignedCourse: assignment,
    completeModule,
    course: props.relatedCourse,
    moduleProgresses,
    modules,
    modulesCompleted,
    onLastQuestion,
    questions: props.relatedQuestions,
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