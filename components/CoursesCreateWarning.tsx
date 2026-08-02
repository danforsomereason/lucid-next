import { Role } from "@/types";
import isInstructing from "@/utils/isInstructing";
import { Container, Alert } from "@mui/material";

export default function CoursesCreateWarning(props: {
  role: Role
}) {
  const instructing = isInstructing({ role: props.role })

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