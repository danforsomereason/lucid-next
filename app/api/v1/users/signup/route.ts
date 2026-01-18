import db from "@/db";
import { usersTable } from "@/schema";
import { registerInputSchema, registerOutputSchema, UserInsert } from "@/types";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const input = registerInputSchema.parse(body);

  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, input.email),
  });

  if (existingUser) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const hashedPassword = await bcryptjs.hash(input.password, 10);
  const values: UserInsert = {
    ...input,
    role: "user",
    password: hashedPassword,
  };
  const [savedUser] = await db
    .insert(usersTable)
    .values(values)
    .returning();

  const token = jwt.sign(
    { userId: savedUser.id },
    "TEST_SECRET", // TODO move this to .env
    { expiresIn: "1h" }
  );
  const cookieStore = await cookies();
  cookieStore.set("token", token);
  const output = registerOutputSchema.parse({
    token,
    user: savedUser,
  });
  return NextResponse.json(output)
}