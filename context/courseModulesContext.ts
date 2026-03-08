import { RelatedCourse, RelatedModule, RelatedQuestion } from "@/types";
import { createContext, useContext } from "react";

export interface CourseModulesContextValue {
  completeModule: () => Promise<void>
  course: RelatedCourse
  selectedModuleId?: string
  selectedModule?: RelatedModule
  modules: RelatedModule[]
  modulesCompleted: boolean
  questions: RelatedQuestion[]
  quizCompleted: boolean
  quizShown: boolean
  selectModule: (moduleId: string) => void
  showQuiz: () => void
}

export const CourseModulesContext = createContext<CourseModulesContextValue | undefined>(undefined);

export function useCourseModules() {
  const value = useContext(CourseModulesContext)
  if (!value) {
    throw new Error("useCourseModules must be used within a CourseModulesProvider")
  }
  return value
}