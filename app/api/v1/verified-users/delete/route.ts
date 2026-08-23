import db from "@/db";
import { verifiedUsersTable } from "@/schema";
import { deleteVerifiedUserInputSchema, deleteVerifiedUserOutputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST (request: Request) {
  const user = await authenticate()
  if (!user) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }
  if (
    user.role !== 'admin' &&
    user.role !== 'instructor' &&
    user.role !== 'super_admin'
  ) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const body: unknown = await request.json();
  const input = deleteVerifiedUserInputSchema.parse(body);
  const condition = eq(verifiedUsersTable.id, input.verifiedUserId)
  const verifiedUser = await db.query.verifiedUsersTable.findFirst({
    where: condition
  })
  if (!verifiedUser) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }
  if (verifiedUser.organizationId !== user.organizationId) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  const result = await db.delete(verifiedUsersTable).where(condition); 
  const outputData = { rowCount: result.rowCount }
  const output = deleteVerifiedUserOutputSchema.parse(outputData)
  return NextResponse.json(output);
}