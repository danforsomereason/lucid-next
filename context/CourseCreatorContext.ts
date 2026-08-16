import { CourseCreatorContextValue } from "@/types";
import { createContext, useContext } from "react";

const CourseCreatorContext = createContext<
  CourseCreatorContextValue | undefined
>(undefined);
export default CourseCreatorContext;

export function useCourseCreator() {
  const courseCreator = useContext(CourseCreatorContext);
  if (!courseCreator) {
    throw new Error("useCourseCreator must be used inside a provider");
  }
  return courseCreator;
}