import { User } from "@/types";

export default function UserName (props: {
  user: User
}) {
  return <>{props.user.firstName} {props.user.lastName}</>
}