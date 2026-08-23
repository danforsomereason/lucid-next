'use client'

import { useUsers } from "@/context/UsersContext";
import VerifiedUserContext from "@/context/VerifiedUserContext";
import { useVerifiedUsers } from "@/context/VerifiedUsersContext";
import { VerifiedUserContextValue } from "@/types";
import { ReactNode, useCallback } from "react";

export default function VerifiedUserProvider(props: {
  children: ReactNode
  verifiedUserId: string
}) {
  const users = useUsers()
  const verifiedUsers = useVerifiedUsers()

  const row = verifiedUsers.rows.find(row => row.id === props.verifiedUserId)
  if (!row) {
    throw new Error(`Verified user with id ${props.verifiedUserId} not found`)
  }

  const user = users.rows.find(u => u.email === row.email)

  const _delete = useCallback(async () => {
    verifiedUsers.delete({ verifiedUserId: props.verifiedUserId })
  }, [])

  const value: VerifiedUserContextValue = {
    delete: _delete,
    row,
    user
  }

  return (
    <VerifiedUserContext.Provider value={value}>
      {props.children}
    </VerifiedUserContext.Provider>
  );
}