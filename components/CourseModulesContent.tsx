import { useCourseModules } from "@/context/courseModulesContext";
import CourseModule from "./CourseModule";
import Quiz from "./Quiz";

export default function CourseModulesContent () {
  const courseModules = useCourseModules()
  if (courseModules.quizShown) {
    return <Quiz />
  }
  return <CourseModule />
}