'use client'

import { createContext, useContext } from "react";
import { VerifiedUsersContextValue } from "@/types";

const VerifiedUsersContext = createContext<VerifiedUsersContextValue | undefined>(undefined);

export default VerifiedUsersContext;

export function useVerifiedUsers() {
  const context = useContext(VerifiedUsersContext)
  if (!context) {
    throw new Error("useVerifiedUsers must be used within a VerifiedUsersProvider")
  }
  return context
}