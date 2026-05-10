import { SURVEY_QUESTIONS } from "@/constants";
import { useCourseModules } from "@/context/courseModulesContext";
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box, Button, Paper, Typography } from "@mui/material";
import SurveyField from "./SurveyField";
import DownloadIcon from "@mui/icons-material/Download";
import { useGlobal } from "@/context/globalContext";
import { generateCertificatePdf } from "@/utils/generateCertificate";
import { useState } from "react";

export default function Survey() {
  const global = useGlobal()
  const courseModules = useCourseModules()
  const [generating, setGenerating] = useState(false)
  const surveyCompleted = courseModules.surveyAnswers.length === SURVEY_QUESTIONS.length
  if (surveyCompleted) {
    return (
      <div>
        <div>Survey Completed</div>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!global.currentUser || generating}
          onClick={async () => {
            if (!global.currentUser) {
              throw new Error("User not found")
            }
            if (!courseModules.assignedCourse.completedAt) {
              throw new Error("Course not completed")
            }
            const tab = window.open("about:blank", "_blank")
            if (!tab) {
              return
            }
            tab.opener = null
            setGenerating(true)
            try {
              const userName = `${global.currentUser.firstName} ${global.currentUser.lastName}`
              const buffer = await generateCertificatePdf({
                userName,
                courseName: courseModules.course.title,
                ceHours: courseModules.course.ceHours,
                completionDate:
                  courseModules.assignedCourse.completedAt,
                score: courseModules.score,
              })
              const blob = new Blob([new Uint8Array(buffer)], {
                type: "application/pdf",
              })
              const url = URL.createObjectURL(blob)
              tab.location.href = url
              window.setTimeout(() => {
                URL.revokeObjectURL(url)
              }, 60_000)
            } catch {
              tab.close()
            } finally {
              setGenerating(false)
            }
          }}
          sx={{ mb: 3 }}
        >
          View certificate
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