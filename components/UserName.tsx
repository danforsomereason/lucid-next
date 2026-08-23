import { useUser } from "@/context/UserContext"

export default function UserName () {
  const user = useUser()

  return <>{user.row.firstName} {user.row.lastName}</>
}