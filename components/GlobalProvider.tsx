'use client'
import GlobalContext from "@/context/GlobalContext";
import { RelatedUser } from "@/types";
import { ReactNode, useState } from "react";

export default function GlobalProvider(props: {
  children: ReactNode
  currentUser?: RelatedUser
}) {
  const [currentUser, setCurrentUser] = useState(props.currentUser);

  return (
    <GlobalContext value={{ currentUser, setCurrentUser }}>
      {props.children}
    </GlobalContext>
  )
}