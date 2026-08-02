import { usersTable } from "@/schema";
import { Db } from "@/types";
import { eq } from "drizzle-orm";

export default async function getRelatedUserById(props: {
  db: Db
  userId: string
}) {
  const user = await props.db.query.usersTable.findFirst({
    where: eq(usersTable.id, props.userId),
    with: {
      organization: true,
    }
  });
  return user
}