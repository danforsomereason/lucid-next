import env from "@/env";
import { usersTable } from "@/schema";
import { Db, LicenseType, RegisterOutput, Role, UserInsert } from "@/types";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export default async function createUser (props: {
  db: Db
} & UserInsert) {
  const existingUser = await props.db.query.usersTable.findFirst({
    where: eq(usersTable.email, props.email),
  });

  if (existingUser) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const hashedPassword = await bcryptjs.hash(props.password, 10);
  const values: UserInsert = {
    email: props.email,
    firstName: props.firstName,
    lastName: props.lastName,
    role: props.role,
    organizationId: props.organizationId,
    password: hashedPassword,
    licenseType: props.licenseType,
  };
  const [savedUser] = await props.db
    .insert(usersTable)
    .values(values)
    .returning();

  const token = jwt.sign(
    { userId: savedUser.id },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const cookieStore = await cookies();
  cookieStore.set("token", token);
  const output: RegisterOutput = {
    token,
    user: savedUser,
  };
  return output
}