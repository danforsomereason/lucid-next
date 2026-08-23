'use client'

import VerifiedUsersContext from "@/context/VerifiedUsersContext";
import { deleteVerifiedUserInputSchema, deleteVerifiedUserOutputSchema, VerifiedUser, VerifiedUsersContextValue } from "@/types";
import axios from "axios";
import { ReactNode, useCallback, useState } from "react";

export default function VerifiedUsersProvider(props: {
  children: ReactNode
  rows: VerifiedUser[]
}) {
  const [rows, setRows] = useState(props.rows)

  const _delete = useCallback(async (props: {
    verifiedUserId: string
  }) => {
    const inputData = { verifiedUserId: props.verifiedUserId }
    const input = deleteVerifiedUserInputSchema.parse(inputData)
    const response = await axios.post('/api/v1/verified-users/delete', input)
    const output = deleteVerifiedUserOutputSchema.parse(response.data)
    console.log('output', output)
    const newRows = rows.filter(row => row.id !== props.verifiedUserId)
    setRows(newRows)
  }, [])

  const value: VerifiedUsersContextValue = {
    rows,
    delete: _delete
  }

  return (
    <VerifiedUsersContext.Provider value={value}>
      {props.children}
    </VerifiedUsersContext.Provider>
  );
}