import UserItem from "@/components/UserItem";
import UsersList from "@/components/UsersList";
import UsersProvider from "@/components/UsersProvider";
import VerifiedUserItem from "@/components/VerifiedUserItem";
import VerifyUserForm from "@/components/VerifyUserForm";
import db from "@/db";
import { usersTable, verifiedUsersTable } from "@/schema";
import authenticate from "@/utils/authenticate";
import getRelatedUsers from "@/utils/getRelatedUsers";
import { eq } from "drizzle-orm";

export default async function DashboardUsers() {
  const currentUser = await authenticate()
  if (!currentUser) {
    return <p>Unauthenticated</p>
  }
  if (!currentUser.organizationId) {
    return <p>Unauthorized</p>
  }
  const usersWhere = eq(usersTable.organizationId, currentUser.organizationId)
  const users = await getRelatedUsers({ db, where: usersWhere })
  const verifiedUsers = await db.query.verifiedUsersTable.findMany({
    where: eq(verifiedUsersTable.organizationId, currentUser.organizationId),
  })

  return (
    <UsersProvider rows={users}>
      <h2>Members ({users.length})</h2>
      <UsersList rows={users} />
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
    </UsersProvider>
  );
}