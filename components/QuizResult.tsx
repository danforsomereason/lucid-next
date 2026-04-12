import { CheckQuestionOutput } from "@/types";
import { Alert, Typography } from "@mui/material";

export default function QuizResult(props: {
  result: CheckQuestionOutput
}) {
  const label = props.result.correct
    ? "Correct!"
    : <>Incorrect. The correct answer was: {props.result.correctAnswer}</>
  return (
    <Alert
      severity={props.result.correct ? "success" : "error"}
      sx={{ mt: 2 }}
    >
      <Typography variant="body1" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2">
        Explanation: {props.result.explanation}
      </Typography>
    </Alert>
  )
}