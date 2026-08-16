'use client'

import UserContext from "@/context/UserContext";
import { useUsers } from "@/context/UsersContext";
import { UserContextValue } from "@/types";
import { ReactNode, useCallback } from "react";

export default function UserProvider(props: {
  children: ReactNode
  userId: string
}) {
  const users = useUsers()
  const row = users.rows.find(row => row.id === props.userId);
  if (!row) {
    throw new Error("User not found");
  }

  const upgrade = useCallback(async () => {
    await users.upgrade({ userId: row.id });
  }, [users, row.id]);

  const value: UserContextValue = {
    row,
    upgrade,
  }

  return (
    <UserContext.Provider value={value}>
      {props.children}
    </UserContext.Provider>
  );
}