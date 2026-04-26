import { useCourseModules } from "@/context/courseModulesContext";
import { Paper, Typography, FormControl, Alert, Box, Button, RadioGroup } from "@mui/material";
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import QuizResults from "./QuizResults";
import { SURVEY_QUESTIONS } from "@/constants";
import OptionView from "./OptionView";
import SurveyField from "./SurveyField";

export default function Survey() {
  const courseModules = useCourseModules()
  // if (!courseModules.selectedQuestion) {
  //   return (
  //     <QuizResults />
  //   )
  // }
  const question = SURVEY_QUESTIONS[courseModules.surveyAnswers.length]
  const onLastQuestion = courseModules.surveyAnswers.length === SURVEY_QUESTIONS.length - 1
  return (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Question {courseModules.surveyAnswers.length + 1} of {SURVEY_QUESTIONS.length}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {question}
      </Typography>

      <SurveyField />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<NavigateBeforeIcon />}
          onClick={() => { }}
          disabled={courseModules.surveyAnswers.length === 0 /*|| showFeedback*/}
        >
          Back
        </Button>
        <Button
          variant="contained"
          endIcon={<NavigateNextIcon />}
          onClick={courseModules.advanceSurvey}
          // disabled={!courseModules.selectedOptionId}
        >
          {onLastQuestion ? 'Finish Survey' : 'Next Question'}
        </Button>
      </Box>
    </Paper>
  );
}