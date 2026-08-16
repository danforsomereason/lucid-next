'use client'

import { useGlobal } from "@/context/GlobalContext";

export default function useGlobalUser() {
  const global = useGlobal()
  if (!global.currentUser) {
    throw new Error('Unauthenticated')
  }
  return global.currentUser
}