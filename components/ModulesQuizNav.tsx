import { useCourseModules } from "@/context/courseModulesContext";
import QuizIcon from "@mui/icons-material/Quiz";
import ModulesNav from "./ModulesNav";

export default function ModulesQuizNav() {
  const courseModules = useCourseModules()
  return (
    <ModulesNav
      completed={courseModules.quizCompleted}
      current={courseModules.assignedCourse.quizAttempts}
      icon={<QuizIcon sx={{ ml: "auto" }} />}
      locked={!courseModules.modulesCompleted}
      onClick={courseModules.showQuiz}
      total={courseModules.course.maximumAttempts}
    >
      Course Quiz
    </ModulesNav>
  )
}