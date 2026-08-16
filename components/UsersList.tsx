import { RelatedUser } from "@/types"
import UsersListConsumer from "./UsersListConsumer"
import UsersProvider from "./UsersProvider"

export default function UsersList(props: {
  rows: RelatedUser[]
}) {
  return (
    <UsersProvider rows={props.rows}>
      <UsersListConsumer />
    </UsersProvider>
  )
}