import { useCourseModules } from "@/context/courseModulesContext";
import { Paper, Typography, FormControl, Alert, Box, Button, RadioGroup } from "@mui/material";
import QuizOption from "./QuizOption";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export default function Quiz() {
  const courseModules = useCourseModules()
  if (!courseModules.selectedQuestion) {
    return <div>REVIEW</div>
  }
  const onLast = courseModules.selectedQuestion.order === courseModules.questions.length - 1
  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Question {courseModules.selectedQuestion.order + 1} of {courseModules.questions.length}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {courseModules.selectedQuestion.questionText}
      </Typography>

      <FormControl component="fieldset">
        <RadioGroup
          value={courseModules.selectedOptionId ?? ''}
          onChange={(event) => {
            courseModules.selectOption(event.target.value)
          }}
        >
          {courseModules.selectedQuestion.options.map((option) => {
            return (
              <QuizOption
                key={option.id}
                option={option}
              />
            )
          })}
        </RadioGroup>
      </FormControl>

      {/* {showFeedback && (
        <Alert
          severity={selectedAnswer.toLowerCase() === currentQuestion.correct_answer.toLowerCase() ? "success" : "error"}
          sx={{ mt: 2 }}
        >
          <Typography variant="body1" gutterBottom>
            {selectedAnswer.toLowerCase() === currentQuestion.correct_answer.toLowerCase()
              ? "Correct!"
              : `Incorrect. The correct answer was: ${currentQuestion.correct_answer}`}
          </Typography>
          <Typography variant="body2">
            {currentQuestion.explanation}
          </Typography>
        </Alert>
      )} */}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={() => {}}
          disabled={courseModules.selectedQuestion.order === 0 /*|| showFeedback*/}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          onClick={() => {}}
          disabled={!courseModules.selectedOptionId}
        >
          {onLast ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </Box>
    </Paper>
  );
}