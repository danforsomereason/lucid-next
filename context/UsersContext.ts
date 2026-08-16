'use client'

import { createContext, useContext } from "react";
import { UsersContextValue } from "@/types";

const UsersContext = createContext<UsersContextValue | undefined>(undefined);

export default UsersContext;

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsers must be used within a UsersProvider");
  }
  return context;
}