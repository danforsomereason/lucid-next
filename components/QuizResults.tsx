'use client'

import React from "react";
import { Box, Typography, Paper, Button, Alert } from "@mui/material";
import { useCourseModules } from "@/context/courseModulesContext";
import QuizResult from "./QuizResult";

const QuizResults: React.FC = () => {
  const courseModules = useCourseModules();
  const passed = courseModules.score >= courseModules.course.passingScore;

  const maximized = courseModules.assignedCourse.quizAttempts >= courseModules.course.maximumAttempts
  const reset = maximized || courseModules.assignedCourse.quizAttempts === 0

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Your Score: {courseModules.score}%
        </Typography>

        {courseModules.results.map((result, index) => {
          return (
            <QuizResult
              key={index}
              result={result}
            />
          )
        })}

        {passed ? (
          <Alert severity="success" sx={{ mb: 3 }}>
            Congratulations! You've passed the quiz!
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {reset
              ? "You've exceeded the maximum number of attempts. Please review the course material and try again."
              : "You didn't pass this time. You can retake the quiz."}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          {passed
            ? (
              <Button
                color="primary"
                onClick={courseModules.showSurvey}
                variant="contained"
              >
                Start Survey
              </Button>
            )
            : reset
              ? (
                <Button
                  color="primary"
                  onClick={courseModules.restart}
                  variant="contained"
                >
                  Restart Course Material
                </Button>
              )
              : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={courseModules.retakeQuiz}
                >
                  Retake Quiz
                </Button>
              )
          }
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizResults;