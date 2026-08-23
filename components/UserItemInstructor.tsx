'use client'

import { useUser } from "@/context/UserContext"
import isInstructing from "@/utils/isInstructing"
import { Button } from "@mui/material"

export default function UserItemInstructor() {
  const user = useUser()
  const instructing = isInstructing({ role: user.row.role })
  if (instructing) {
    return <></>
  }
  return (
    <Button
      onClick={user.upgrade}
    >
      Upgrade to Instructor
    </Button>
  )
}