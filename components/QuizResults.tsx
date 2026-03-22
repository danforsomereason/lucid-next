'use client'

import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Button, Alert } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import { useCourseModules } from "@/context/courseModulesContext";

const QuizResults: React.FC = () => {
  const courseModules = useCourseModules();
  const correctAnswers = courseModules.results.filter(result => result.correct)
  const score = Math.round((correctAnswers.length / courseModules.results.length) * 100);
  const passed = score >= courseModules.course.passingScore;
  const certificateUrl = 'CERTIFICATE_URL'

  // const generateCertificate = async () => {
  //   try {
  //     const response = await fetch(
  //       "http://localhost:5001/api/v1/certificates",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           course_id: state.courseId,
  //           score: state.score,
  //         }),
  //       }
  //     );

  //     if (!response.ok) throw new Error("Failed to generate certificate");

  //     const data = await response.json();
  //     setCertificateUrl(data.certificateUrl);
  //   } catch (err) {
  //     setError("Failed to generate certificate. Please try again later.");
  //   }
  // };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>

        <Typography variant="h5" sx={{ mb: 3 }}>
          Your Score: {score}%
        </Typography>

        {passed ? (
          <>
            <Alert severity="success" sx={{ mb: 3 }}>
              Congratulations! You've passed the quiz!
            </Alert>
            {certificateUrl && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => window.open(certificateUrl)}
                sx={{ mb: 3 }}
              >
                Download Certificate
              </Button>
            )}
          </>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {state.attemptNumber >= 2
              ? "You've exceeded the maximum number of attempts. Please review the course material and try again."
              : "You didn't pass this time. You can retake the quiz once more."}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate("/")}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => navigate("/courses")}
          >
            Courses
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
          {!passed && state.attemptNumber < 2 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleRetake}
            >
              Retake Quiz
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default QuizResults;