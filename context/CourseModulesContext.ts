import { CourseModulesContextValue } from "@/types";
import { createContext, useContext } from "react";

const CourseModulesContext = createContext<CourseModulesContextValue | undefined>(undefined);
export default CourseModulesContext;

export function useCourseModules() {
  const value = useContext(CourseModulesContext)
  if (!value) {
    throw new Error("useCourseModules must be used within a CourseModulesProvider")
  }
  return value
}