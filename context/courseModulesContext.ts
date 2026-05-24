import { RelatedCourse, Option, SafeQuestion, CheckQuestionOutput, AssignedCourse, SurveyAnswer, Module, ModuleProgress } from "@/types";
import { createContext, useContext } from "react";

export interface CourseModulesContextValue {
  advanceQuestion: () => Promise<void>
  advanceSurvey: () => Promise<void>
  assignedCourse: AssignedCourse
  completeModule: () => Promise<void>
  course: RelatedCourse
  moduleProgresses: ModuleProgress[]
  modules: Module[]
  modulesCompleted: boolean
  onLastQuestion: boolean
  questions: SafeQuestion[]
  quizCompleted: boolean
  quizShown: boolean
  results: CheckQuestionOutput[]
  restart: () => void
  retakeQuiz: () => void
  score: number
  selectModule: (moduleId: string) => void
  selectOption: (optionId: string) => void
  selectedModuleId?: string
  selectedModule?: Module
  selectedOption?: Option
  selectedOptionId?: string
  selectedQuestionId?: string
  selectedQuestion?: SafeQuestion
  selectSurveyAnswer: (answer: string) => void
  showQuiz: () => void
  showSurvey: () => void
  surveyAnswer: string
  surveyAnswers: SurveyAnswer[]
  surveyCompleted: boolean
  surveyShown: boolean
}

export const CourseModulesContext = createContext<CourseModulesContextValue | undefined>(undefined);

export function useCourseModules() {
  const value = useContext(CourseModulesContext)
  if (!value) {
    throw new Error("useCourseModules must be used within a CourseModulesProvider")
  }
  return value
}