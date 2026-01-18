import db from "@/db";
import { usersTable } from "@/schema";
import { loginInputSchema } from "@/types";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const input = loginInputSchema.parse(body)
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, input.email),
  });
  console.log("Existing user:", existingUser);

  if (existingUser) {
    const matchingPassword = await bcryptjs.compare(
      input.password,
      existingUser.password
    );
    console.log("Body password", input.password);

    console.log("Matching password:", matchingPassword);
    // "guard pattern" presumes you have a password and returns if not
    if (!matchingPassword) {
      return NextResponse.json({ message: "wrong password" }, { status: 400 });
    }
    const decoded = { userId: existingUser.id };
    const token = jwt.sign(
      decoded,
      "TEST_SECRET", // TODO move this to .env
      { expiresIn: "1h" }
    );
    const cookieStore = await cookies();
    cookieStore.set("token", token);
    return NextResponse.json({ token, user: existingUser });
  } else {
    return NextResponse.json({ message: "invalid" }, { status: 400 });
  }
}