import db from "@/db";
import { organizationsTable, verifiedUsersTable } from "@/schema";
import { registerOutputSchema, registerTeamInputSchema, VerifiedUserInsert, OrganizationInsert } from "@/types";
import createUser from "@/utils/createUser";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const input = registerTeamInputSchema.parse(body);

  const insert: OrganizationInsert = {
    name: input.organization
  };
  const [organization] = await db.insert(organizationsTable).values(insert).returning()
  const creation = await createUser({
    ...input,
    db,
    organizationId: organization.id,
    role: 'admin',
    join: false
  });
  const inserts = input.verifiedUsers.map((email) => {
    const insert: VerifiedUserInsert = {
      email,
      organizationId: organization.id
    }
    return insert;
  })
  await db.insert(verifiedUsersTable).values(inserts);

  const output = registerOutputSchema.parse(creation);
  return NextResponse.json(output)
}