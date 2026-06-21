import { verifiedUsersTable } from "@/schema";
import { Db } from "@/types";
import { eq } from "drizzle-orm";

export default async function getRegisterOrganizationId (props: {
  db: Db
  email: string
  join: boolean
  organizationId: string | null | undefined
}) {
  if (props.organizationId || !props.join) {
    return props.organizationId;
  }

  const verifiedUser = await props.db.query.verifiedUsersTable.findFirst({
    where: eq(verifiedUsersTable.email, props.email),
  });

  if (verifiedUser) {
    return verifiedUser.organizationId;
  }
}