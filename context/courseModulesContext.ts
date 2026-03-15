import { RelatedCourse, RelatedModule, RelatedQuestion, Option, SafeQuestion } from "@/types";
import { createContext, useContext } from "react";

export interface CourseModulesContextValue {
  checkQuiz: () => Promise<void>
  completeModule: () => Promise<void>
  course: RelatedCourse
  modules: RelatedModule[]
  modulesCompleted: boolean
  selectModule: (moduleId: string) => void
  selectOption: (optionId: string) => void
  selectedModuleId?: string
  selectedModule?: RelatedModule
  selectedOption?: Option
  selectedOptionId?: string
  selectedQuestionId?: string
  selectedQuestion?: SafeQuestion
  showQuiz: () => void
  questions: SafeQuestion[]
  quizCompleted: boolean
  quizShown: boolean
}

export const CourseModulesContext = createContext<CourseModulesContextValue | undefined>(undefined);

export function useCourseModules() {
  const value = useContext(CourseModulesContext)
  if (!value) {
    throw new Error("useCourseModules must be used within a CourseModulesProvider")
  }
  return value
}