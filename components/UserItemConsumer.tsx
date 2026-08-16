'use client'

import { User } from "@/types"
import UserName from "./UserName"
import UserItemInstructor from "./UserItemInstructor"
import { useUser } from "@/context/UserContext"

export default function UserItemConsumer() {
  const user = useUser()
  return (
    <li>
      <p>
        <UserName user={user.row} />
        {' '}
        [{user.row.role}]
      </p>
      <UserItemInstructor user={user.row} />
    </li>
  )
}