'use client'

import { useGlobal } from "@/context/GlobalContext";
import UsersContext from "@/context/UsersContext";
import { RelatedUser, UpgradeUserInput, upgradeUserInputSchema, upgradeUserOutputSchema, UsersContextValue } from "@/types";
import { ReactNode, useState, useCallback } from "react";

export default function UsersProvider(props: {
  children: ReactNode
  rows: RelatedUser[]
}) {
  const global = useGlobal()
  const [rows, setRows] = useState(props.rows)

  const upgrade = useCallback(async (props: {
    userId: string
  }) => {
    const input: UpgradeUserInput = {
      userId: props.userId,
    }
    const parsed = upgradeUserInputSchema.parse(input);
    const json = JSON.stringify(parsed);
    const response = await fetch('/api/v1/users/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json,
    });
    const data = await response.json();
    const output = upgradeUserOutputSchema.parse(data);

    const newUsers = rows.map(user => {
      if (user.id !== output.id) {
        return user;
      }
      return output;
    })
    setRows(newUsers);
    if (output.id === global.currentUser?.id) {
      global.setCurrentUser(output);
    }
  }, [])

  const value: UsersContextValue = {
    rows,
    upgrade,
  }

  return (
    <UsersContext.Provider value={value}>
      {props.children}
    </UsersContext.Provider>
  );
}