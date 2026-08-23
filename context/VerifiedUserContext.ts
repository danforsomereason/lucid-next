'use client'

import { createContext, useContext } from "react";
import { VerifiedUserContextValue } from "@/types";

const VerifiedUserContext = createContext<VerifiedUserContextValue | undefined>(undefined);

export default VerifiedUserContext;

export function useVerifiedUser() {
  const context = useContext(VerifiedUserContext)
  if (!context) {
    throw new Error("useVerifiedUsers must be used within a VerifiedUsersProvider")
  }
  return context
}