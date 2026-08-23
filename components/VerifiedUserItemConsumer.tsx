'use client'

import { useVerifiedUser } from "@/context/VerifiedUserContext"
import { Button } from "@mui/material"

export default function VerifiedUserItemConsumer() {
  const verifiedUser = useVerifiedUser()
  if (verifiedUser.user) {
    return <></>
  }
  return (
    <li key={verifiedUser.row.id}>
      <p>
        {verifiedUser.row.email}
      </p>
      <Button onClick={async () => {
        await verifiedUser.delete()
      }}>
        Delete
      </Button>
    </li>
  )
}