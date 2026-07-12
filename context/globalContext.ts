'use client'

import { RelatedUser } from "@/types";
import { createContext, Dispatch, SetStateAction, useContext } from "react";

export interface GlobalValue {
  currentUser?: RelatedUser
  setCurrentUser: Dispatch<SetStateAction<RelatedUser | undefined>>;
}

export const globalContext = createContext<GlobalValue | undefined>(undefined);

export function useGlobal() {
  const context = useContext(globalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}