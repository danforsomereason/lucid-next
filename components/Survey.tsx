import { SURVEY_QUESTIONS } from "@/constants";
import { useCourseModules } from "@/context/courseModulesContext";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Button, Paper, Typography } from "@mui/material";
import SurveyField from "./SurveyField";
import DownloadIcon from "@mui/icons-material/Download";

export default function Survey() {
  const courseModules = useCourseModules()
  const surveyCompleted = courseModules.surveyAnswers.length === SURVEY_QUESTIONS.length
  if (surveyCompleted) {
    if (!courseModules.assignedCourse.certificateUrl) {
      throw new Error('Certificate URL is missing')
    }
    return (
      <div>
        <div>Survey Completed</div>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {
            if (!courseModules.assignedCourse.certificateUrl) {
              throw new Error('Certificate URL is missing')
            }
            window.open(courseModules.assignedCourse.certificateUrl)
          }}
          sx={{ mb: 3 }}
        >
          Download Certificate
        </Button>
      </div>
    )
  }
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