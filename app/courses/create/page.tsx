import CoursesCreateUpgrade from "@/components/CoursesCreateUpgrade";
import CoursesCreateWarning from "@/components/CoursesCreateWarning";
import CreateCourseProvider from "@/components/CreateCourseProvider";
import db from "@/db";
import { usersTable } from "@/schema";
import authenticateRedirect from "@/utils/authenticateRedirect";
import { and, eq, ne } from "drizzle-orm";

export default async function CoursesCreate() {
  const user = await authenticateRedirect(true)
  if (!user.organizationId) {
    return <>You must belong to an organization to create a course.</>;
  }
  const condition = and(
    eq(usersTable.organizationId, user.organizationId),
    ne(usersTable.role, "super_admin"),
    ne(usersTable.role, 'instructor')
  )
  const users = await db.query.usersTable.findMany({
    where: condition,
  });
  return (
    <>
      <CoursesCreateWarning
        role={user.role}
      />
      <CoursesCreateUpgrade
        user={user}
        users={users}
      />
      <CreateCourseProvider user={user} />
    </>
  )
}