import Button from "@mui/material/Button"
import { generateCertificatePdf } from "@/utils/generateCertificate";
import { useCourseModules } from "@/context/courseModulesContext";
import { useGlobal } from "@/context/globalContext";
import { useState } from "react";
import { Alert, Box, Paper, Typography } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import { useRouter } from "next/navigation";

export default function SurveyCompleted() {
  const global = useGlobal()
  const courseModules = useCourseModules()
  const router = useRouter()
  const [generating, setGenerating] = useState(false)
  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>

        <Typography variant="h4" gutterBottom>
          Survey Completed
        </Typography>

        <Alert severity="success" sx={{ mb: 3 }}>
          Congratulations! You've passed the course!
        </Alert>

        <Box sx={{ display: "flex", gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => router.push("/")}
          >
            Home
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            onClick={() => router.push("/courses")}
          >
            Courses
          </Button>
          <Button
            variant="outlined"
            startIcon={<PersonIcon />}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </Button>

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
          >
            View certificate
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}