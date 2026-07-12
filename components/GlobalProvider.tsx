'use client'
import { globalContext } from "@/context/globalContext";
import { RelatedUser } from "@/types";
import { ReactNode, useState } from "react";

export default function GlobalProvider(props: {
  children: ReactNode
  currentUser?: RelatedUser
}) {
  const [currentUser, setCurrentUser] = useState(props.currentUser);

  return (
    <globalContext.Provider value={{ currentUser, setCurrentUser }}>
      {props.children}
    </globalContext.Provider>
  )
}