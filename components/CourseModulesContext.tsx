import { useCourseModules } from "@/context/courseModulesContext";
import CourseModule from "./CourseModule";

export default function CourseModulesContent () {
  const courseModules = useCourseModules()
  if (courseModules.quizShown) {
    return <div>QUIZ</div>
  }
  return <CourseModule />
}