import { INSTRUCTOR_ROLES, Role } from "@/types";

export default function isInstructing(props: {
  role: Role
}) {
  const instructing = INSTRUCTOR_ROLES.includes(props.role)
  return instructing
}