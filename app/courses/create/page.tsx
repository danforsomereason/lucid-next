import CreateCourseProvider from "@/components/CreateCourseProvider";
import CoursesCreateUpgrade from "@/components/CoursesCreateUpgrade";
import db from "@/db";
import { usersTable } from "@/schema";
import authenticateRedirect from "@/utils/authenticateRedirect";
import { and, eq, ne } from "drizzle-orm";

export default async function CoursesCreate() {
  const user = await authenticateRedirect(true)
  if (!user.organizationId) {
    return <>You must belong to an organization to create a course.</>;
  }
  if (!["instructor", "super_admin"].includes(user.role)) {
    const condition = and(
      eq(usersTable.organizationId, user.organizationId),
      ne(usersTable.role, "super_admin"),
      ne(usersTable.role, 'instructor')
    )
    const users = await db.query.usersTable.findMany({
      where: condition,
    });
    return (
      <CoursesCreateUpgrade
        user={user}
        users={users}
      />
    )
  }

  return (
    <CreateCourseProvider />
  );
}