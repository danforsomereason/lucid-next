import PollIcon from "@mui/icons-material/Poll";
import { useCourseModules } from "@/context/courseModulesContext";
import { SURVEY_QUESTIONS } from "@/constants";
import ModulesNav from "./ModulesNav";

export default function ModulesSurveyNav() {
  const courseModules = useCourseModules()
  const completed = courseModules.surveyAnswers.length === SURVEY_QUESTIONS.length
  return (
    <ModulesNav
      completed={completed}
      current={courseModules.surveyAnswers.length}
      icon={<PollIcon sx={{ ml: "auto" }} />}
      locked={!courseModules.quizCompleted}
      onClick={courseModules.showSurvey}
      total={SURVEY_QUESTIONS.length}
    >
      Course Survey
    </ModulesNav>
  )
}