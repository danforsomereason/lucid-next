import { Typography } from "@mui/material";
import { SectionItem } from "./styled";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useCourseModules } from "@/context/courseModulesContext";

export default function ModulesQuizNav() {
  const courseModules = useCourseModules()
  return (
    <SectionItem
      sx={{
        mt: 2,
        borderTop: 1,
        borderColor: "divider",
        opacity:
          courseModules.modulesCompleted ? 1 : 0.5,
        pointerEvents:
          courseModules.modulesCompleted
            ? "auto"
            : "none",
      }}
    >
      {courseModules.quizCompleted ? (
        <CheckCircleIcon color="success" />
      ) : (
        <CancelIcon color="disabled" />
      )}
      <Typography
        color={
          courseModules.quizCompleted ? "text.primary" : "text.secondary"
        }
      >
        Course Quiz
        {' '}
        {!courseModules.quizCompleted && (
          <>
          (
            {courseModules.assignedCourse.quizAttempts}
            /
            {courseModules.course.maximumAttempts}
          )
          </>
        )}
      </Typography>
      <QuizIcon sx={{ ml: "auto" }} />
    </SectionItem>
  )
}