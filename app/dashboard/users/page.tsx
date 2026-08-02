import UserItem from "@/components/UserItem";
import VerifiedUserItem from "@/components/VerifiedUserItem";
import VerifyUserForm from "@/components/VerifyUserForm";
import db from "@/db";
import { usersTable, verifiedUsersTable } from "@/schema";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";

export default async function DashboardUsers() {
  const currentUser = await authenticate()
  if (!currentUser) {
    return <p>Unauthenticated</p>
  }
  if (!currentUser.organizationId) {
    return <p>Unauthorized</p>
  }
  const users = await db.query.usersTable.findMany({
    where: eq(usersTable.organizationId, currentUser.organizationId),
  })
  const verifiedUsers = await db.query.verifiedUsersTable.findMany({
    where: eq(verifiedUsersTable.organizationId, currentUser.organizationId),
  })

  return (
    <>

      <h2>Members ({users.length})</h2>
      <ol>
        {users.map((user) => {
          return (
            <UserItem
              key={user.id}
              user={user}
            />
          )
        })}
      </ol>
      <h2>Invite New Verified User</h2>
      <VerifyUserForm />
      <h2>Pending Invites ({verifiedUsers.length})</h2>
      <ol>
        {verifiedUsers.map((verifiedUser) => {
          const user = users.find(u => u.email === verifiedUser.email)
          return (
            <VerifiedUserItem
              key={verifiedUser.id}
              verifiedUser={verifiedUser}
              user={user}
            />
          )
        })}
      </ol>
    </>
  );
}