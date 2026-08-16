'use client'

import UserProvider from "./UserProvider"
import UserItemConsumer from "./UserItemConsumer"

export default function UserItem(props: {
  userId: string
}) {
  return (
    <UserProvider userId={props.userId}>
      <UserItemConsumer />
    </UserProvider>
  )
}