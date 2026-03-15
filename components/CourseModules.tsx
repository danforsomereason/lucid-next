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
  async function checkQuiz () {
    const inputData: CheckQuizInput = {
      answers: answers,
      courseId: relatedCourse.id,
    }
    const input = checkQuizInputSchema.parse(inputData)
    const response = await axios.post("/api/v1/quiz/check", input)
    const output = checkQuizOutputSchema.parse(response.data)
    setResults(output.results)
  }
  const value: CourseModulesContextValue = {
    checkQuiz,
    completeModule,
    course: relatedCourse,
    modules,
    modulesCompleted,
    questions: relatedQuestions,
    quizCompleted,
    quizShown,
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