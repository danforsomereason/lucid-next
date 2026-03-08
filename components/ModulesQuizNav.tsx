import { Typography } from "@mui/material";
import { SectionItem } from "./styled";
import QuizIcon from "@mui/icons-material/Quiz";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface ModulesQuizNavProps {
  modulesCompleted: boolean
  quizCompleted: boolean
}

export default function ModulesQuizNav({
  modulesCompleted,
  quizCompleted
}: ModulesQuizNavProps) {
  return (
    <SectionItem
      sx={{
        mt: 2,
        borderTop: 1,
        borderColor: "divider",
        opacity:
          modulesCompleted ? 1 : 0.5,
        pointerEvents:
          modulesCompleted
            ? "auto"
            : "none",
      }}
    >
      {quizCompleted ? (
        <CheckCircleIcon color="success" />
      ) : (
        <CancelIcon color="disabled" />
      )}
      <Typography
        color={
          quizCompleted ? "text.primary" : "text.secondary"
        }
      >
        Course Quiz
      </Typography>
      <QuizIcon sx={{ ml: "auto" }} />
    </SectionItem>
  )
}