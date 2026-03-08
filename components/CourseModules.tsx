'use client'

import { CourseModulesContext, CourseModulesContextValue } from "@/context/courseModulesContext"
import { EndModuleInput, endModuleInputSchema, endModuleOutputSchema, RelatedCourse, RelatedModule, RelatedQuestion } from "@/types"
import areModulesCompleted from "@/utils/areModulesCompleted"
import axios from "axios"
import { useState } from "react"
import CourseModulesContent from "./CourseModulesContext"
import ModulesSidebarController from "./ModulesSidebarController"
import { MainContent, ModuleContainer } from "./styled"

interface CourseModulesProps {
  relatedCourse: RelatedCourse
  relatedModules: RelatedModule[]
  relatedQuestions: RelatedQuestion[]
}

export default function CourseModules({
  relatedCourse,
  relatedModules,
  relatedQuestions,
}: CourseModulesProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | undefined>(relatedModules[0].id)
  const [modules, setModules] = useState(relatedModules)
  const [questions, setQuestions] = useState(relatedQuestions)
  const [quizShown, setQuizShown] = useState(false)
  const modulesCompleted = areModulesCompleted(modules) 
  const quizCompleted = questions.every((question) => question.answers.length > 0)
  const selectedModule = modules.find((module) => module.id === selectedModuleId)
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
  }
  function showQuiz () {
    setQuizShown(true)
    setSelectedModuleId(undefined)
  }
  const value: CourseModulesContextValue = {
    completeModule,
    course: relatedCourse,
    modules,
    modulesCompleted,
    questions,
    quizCompleted,
    quizShown,
    selectModule,
    selectedModule,
    selectedModuleId,
    showQuiz
  }
  return (
    <CourseModulesContext value={value}>
      <ModuleContainer id='module-container'>
        <ModulesSidebarController />
        <MainContent>
          <CourseModulesContent />
        </MainContent>
      </ModuleContainer>
    </CourseModulesContext>
  )
}