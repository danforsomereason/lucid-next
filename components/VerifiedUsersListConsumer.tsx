'use client'

import { useVerifiedUsers } from "@/context/VerifiedUsersContext"
import VerifiedUserItem from "./VerifiedUserItem"

export default function VerifiedUsersListConsumer() {
  const verifiedUsers = useVerifiedUsers()
  return (
    <>
      <h2>Pending Invites ({verifiedUsers.rows.length})</h2>
      <ol>
        {verifiedUsers.rows.map((verifiedUser) => {
          return (
            <VerifiedUserItem
              key={verifiedUser.id}
              verifiedUserId={verifiedUser.id}
            />
          )
        })}
      </ol>
    </>
  )
}