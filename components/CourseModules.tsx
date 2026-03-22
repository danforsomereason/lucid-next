'use client'

import { CourseModulesContext, CourseModulesContextValue } from "@/context/courseModulesContext"
import { CheckQuestionInput, CheckQuestionOutput, CheckQuizInput, checkQuizInputSchema, checkQuizOutputSchema, EndModuleInput, endModuleInputSchema, endModuleOutputSchema, RelatedCourse, RelatedModule, SafeQuestion } from "@/types"
import areModulesCompleted from "@/utils/areModulesCompleted"
import axios from "axios"
import { useState } from "react"
import CourseModulesContent from "./CourseModulesContext"
import ModulesSidebarController from "./ModulesSidebarController"
import { MainContent, ModuleContainer } from "./styled"
import { Check } from "drizzle-orm/gel-core"
import { ne } from "drizzle-orm"

interface CourseModulesProps {
  relatedCourse: RelatedCourse
  relatedModules: RelatedModule[]
  relatedQuestions: SafeQuestion[]
}

export default function CourseModules({
  relatedCourse,
  relatedModules,
  relatedQuestions,
}: CourseModulesProps) {
  const [results, setResults] = useState<CheckQuestionOutput[]>([])
  const [modules, setModules] = useState(relatedModules)
  const modulesCompleted = areModulesCompleted(modules) 
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(() => {
    if (modulesCompleted) {
      return undefined
    }
    return relatedModules[0].id
  })
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(() => {
    if (modulesCompleted) {
      return relatedQuestions[0].id
    }
    return undefined
  })
  const [quizShown, setQuizShown] = useState(modulesCompleted)
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined)
  const [answers, setAnswers] = useState<CheckQuestionInput[]>([])
  const quizCompleted = relatedQuestions.every((question) => question.answers.length > 0)
  const selectedModule = modules.find((module) => module.id === selectedModuleId)
  const selectedQuestion = relatedQuestions.find((question) => question.id === selectedQuestionId)
  console.log('selectedQuestion', selectedQuestion)
  const selectedOption = selectedQuestion?.options.find((option) => option.id === selectedOptionId)
  const onLastQuestion = selectedQuestion?.order === relatedQuestions.length - 1
  async function completeModule() {
    if (!selectedModuleId) {
      throw new Error('No module selected')
    }
    const body: EndModuleInput = { moduleId: selectedModuleId }
    const input = endModuleInputSchema.parse(body)
    console.log('input', input)
    const response = await axios.post("/api/v1/modules/end", body)
    const output = endModuleOutputSchema.parse(response.data)
    console.log('output', output)
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
    console.log('newRelatedModules', newRelatedModules)
    setModules(newRelatedModules)
    const completed = areModulesCompleted(newRelatedModules)
    console.log('completed', completed)
    if (completed) {
      showQuiz()
    }
  }
  function selectModule(moduleId: string) {
    setSelectedModuleId(moduleId)
    setQuizShown(false)
    setSelectedQuestionId(undefined)
  }
  function selectOption (optionId: string) {
    setSelectedOptionId(optionId)
  }
  function showQuiz () {
    setQuizShown(true)
    setSelectedModuleId(undefined)
  }
  async function checkQuiz (answers: CheckQuestionInput[]) {
    const inputData: CheckQuizInput = {
      answers,
      courseId: relatedCourse.id,
    }
    const input = checkQuizInputSchema.parse(inputData)
    const response = await axios.post("/api/v1/questions/check", input)
    const output = checkQuizOutputSchema.parse(response.data)
    setResults(output.results)
  }
  async function advanceQuestion () {
    if (!selectedQuestion) {
      throw new Error("No question selected")
    }
    if (!selectedOption) {
      throw new Error("No option selected")
    }
    const newAnswer: CheckQuestionInput = {
      questionId: selectedQuestion.id,
      selectedOptionOrder: selectedOption.order,
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
  const value: CourseModulesContextValue = {
    advanceQuestion,
    completeModule,
    course: relatedCourse,
    modules,
    modulesCompleted,
    onLastQuestion,
    questions: relatedQuestions,
    quizCompleted,
    quizShown,
    results,
    selectModule,
    selectOption,
    selectedModule,
    selectedModuleId,
    selectedOption,
    selectedOptionId, 
    selectedQuestion,
    selectedQuestionId,
    showQuiz
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