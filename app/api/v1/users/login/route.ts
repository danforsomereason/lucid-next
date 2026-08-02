import db from "@/db";
import { usersTable } from "@/schema";
import { loginInputSchema, loginOutputSchema, TokenPayload } from "@/types";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken'
import { cookies } from "next/headers";
import env from "@/env";

export async function POST(request: Request) {
  const body: unknown = await request.json()
  console.log('body', body)
  const input = loginInputSchema.parse(body)
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, input.email),
    with: {
      organization: true,
    }
  });

  if (existingUser) {
    const matchingPassword = await bcryptjs.compare(
      input.password,
      existingUser.password
    );
    // "guard pattern" presumes you have a password and returns if not
    if (!matchingPassword) {
      return NextResponse.json({ message: "wrong password" }, { status: 400 });
    }
    const payload: TokenPayload = { userId: existingUser.id };
    const token = jwt.sign(
      payload,
      env.JWT_SECRET, // TODO move this to .env
      { expiresIn: "1h" }
    );
    const cookieStore = await cookies();
    cookieStore.set("token", token);
    const outputData = { token, user: existingUser }
    const output = loginOutputSchema.parse(outputData);
    return NextResponse.json(output);
  } else {
    return NextResponse.json({ message: "invalid" }, { status: 400 });
  }
}