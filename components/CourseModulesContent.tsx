import { useCourseModules } from "@/context/CourseModulesContext";
import CourseModule from "./CourseModule";
import Quiz from "./Quiz";
import Survey from "./Survey";

export default function CourseModulesContent () {
  const courseModules = useCourseModules()
  if (courseModules.surveyShown) {
    return <Survey />
  }
  if (courseModules.quizShown) {
    return <Quiz />
  }
  return <CourseModule />
}