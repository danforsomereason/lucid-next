'use client'

import { User, VerifiedUser } from "@/types"
import { Button } from "@mui/material"

export default function VerifiedUserItem(props: {
  verifiedUser: VerifiedUser
  user: User | undefined
}) {
  if (props.user) {
    return <></>
  }
  return (
    <li key={props.verifiedUser.id}>
      <p>
        {props.verifiedUser.email}
      </p>
      <Button>
        Delete
      </Button>
    </li>
  )
}