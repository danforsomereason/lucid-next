'use client'

import { User } from "@/types"
import isInstructing from "@/utils/isInstructing"
import { Button } from "@mui/material"
import axios from "axios"

export default function UserItemInstructor(props: {
  user: User
}) {
  const instructing = isInstructing({ role: props.user.role })
  if (instructing) {
    return <></>
  }
  return (
    <Button
      onClick={async () => {
        await axios.post(`/api/v1/users/upgrade`, {
          userId: props.user.id,
        })
      }}
    >
      Upgrade to Instructor
    </Button>
  )
}