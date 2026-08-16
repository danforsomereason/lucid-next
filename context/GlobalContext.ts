'use client'

import { GlobalValue } from "@/types";
import { createContext, useContext } from "react";

const GlobalContext = createContext<GlobalValue | undefined>(undefined);
export default GlobalContext;

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalContext");
  }
  return context;
}