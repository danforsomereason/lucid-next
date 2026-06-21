'use client'

import { VerifiedUser } from "@/types"
import { Button } from "@mui/material"

export default function VerifiedUserItem(props: {
  verifiedUser: VerifiedUser
}) {
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