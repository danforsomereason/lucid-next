'use client'

import { useCourseModules } from "@/context/courseModulesContext"
import { Paper, Typography, Box, Button } from "@mui/material"
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

export default function CourseModule() {
  const courseModules = useCourseModules()
  if (!courseModules.selectedModule) {
    throw new Error('There is no selected module')
  }
  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {courseModules.selectedModule.heading}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          {courseModules.selectedModule.content}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 4,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Estimated time: {courseModules.selectedModule.estimatedMinutes}{" "}
          minutes
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          endIcon={<NavigateNextIcon />}
          onClick={courseModules.completeModule}
        >
          NEXT
        </Button>
      </Box>
    </Paper>
  )
}