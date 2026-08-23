import { VerifiedUser } from "@/types"
import VerifiedUsersProvider from "./VerifiedUsersProvider"
import VerifiedUsersListConsumer from "./VerifiedUsersListConsumer"

export default function VerifiedUsersList(props: {
  verifiedUsers: VerifiedUser[]
}) {
  return (
    <>
      <VerifiedUsersProvider rows={props.verifiedUsers}>
        <VerifiedUsersListConsumer />
      </VerifiedUsersProvider>
    </>
  )
}