'use client'

import UserName from "./UserName"
import UserItemInstructor from "./UserItemInstructor"
import { useUser } from "@/context/UserContext"

export default function UserItemConsumer() {
  const user = useUser()
  return (
    <li>
      <p>
        <UserName />
        {' '}
        [{user.row.role}]
      </p>
      <UserItemInstructor />
    </li>
  )
}