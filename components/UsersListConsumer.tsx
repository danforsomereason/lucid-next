'use client'

import { useUsers } from "@/context/UsersContext"
import UserItem from "./UserItem"

export default function UsersListConsumer() {
  const users = useUsers()
  const items = users.rows.map((user) => {
    return (
      <UserItem
        key={user.id}
        userId={user.id}
      />
    )
  })
  return (
    <ol>
      {items}
    </ol>
  )
}