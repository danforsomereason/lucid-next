import db from "@/db";
import { usersTable } from "@/schema";
import { upgradeUserInputSchema, upgradeUserOutputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const auth = await authenticate()
  if (!auth) {
    return NextResponse.json({
      message: "You must be logged in to register for a course",
    }, { status: 401 });
  }
  const body: unknown = await req.json()
  const input = upgradeUserInputSchema.parse(body)

  const condition = eq(usersTable.id, input.userId)
  const user = await db.query.usersTable.findFirst({
    where: condition,
  });
  if (!user) {
    return NextResponse.json(
      { message: "User not found" }, { status: 404 }
    )
  }
  if (user.organizationId !== auth.organizationId) {
    return NextResponse.json(
      { message: "User does not belong to your organization" },
      { status: 403 }
    );
  }
  if (user.role === 'super_admin' ) {
    return NextResponse.json(
      { message: "User is already a super admin" },
      { status: 403 }
    );
  }
  if (user.role === 'instructor' ) {
    return NextResponse.json(
      { message: "User is already an instructor" },
      { status: 403 }
    );
  }

  const [updated] = await db.update(usersTable).set({
    role: 'instructor',
  }).where(condition).returning();
  const output = upgradeUserOutputSchema.parse(updated);
  return NextResponse.json(output);
}