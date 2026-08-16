'use client'

import isInstructing from "@/utils/isInstructing";
import useGlobalUser from "@/utils/useGlobalUser";
import { Container, Alert } from "@mui/material";

export default function CoursesCreateWarning() {
  const globalUser = useGlobalUser()
  const instructing = isInstructing({ role: globalUser.role })

  if (instructing) {
    return <></>
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Alert severity="warning">
        You must be classified as an instructor to create a course.
      </Alert>
    </Container>
  )
}