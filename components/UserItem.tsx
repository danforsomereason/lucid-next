'use client'

import { User } from "@/types"
import { Button } from "@mui/material"
import UserName from "./UserName"

export default function UserItem(props: {
  user: User
}) {
  return (
    <li key={props.user.id}>
      <p>
        <UserName user={props.user} />
      </p>
      <Button>
        Remove
      </Button>
    </li>
  )
}