import env from "@/env";
import { usersTable, verifiedUsersTable } from "@/schema";
import { Db, LicenseType, RegisterOutput, Role, UserInsert } from "@/types";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import getRegisterOrganizationId from "./getRegisterOrganizationId";
import guardRelatedUserById from "./guardRelatedUserById";

export default async function createUser (props: {
  db: Db
  join: boolean
} & UserInsert): Promise<RegisterOutput> {
  const existingUser = await props.db.query.usersTable.findFirst({
    where: eq(usersTable.email, props.email),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const organizationId = await getRegisterOrganizationId({
    db: props.db,
    email: props.email,
    join: props.join,
    organizationId: props.organizationId,
  });

  const hashedPassword = await bcryptjs.hash(props.password, 10);
  const values: UserInsert = {
    email: props.email,
    firstName: props.firstName,
    lastName: props.lastName,
    role: props.role,
    organizationId,
    password: hashedPassword,
    licenseType: props.licenseType,
  };
  const [savedUser] = await props.db
    .insert(usersTable)
    .values(values)
    .returning();
  const relatedUser = await guardRelatedUserById({
    db: props.db,
    userId: savedUser.id,
  });

  const token = jwt.sign(
    { userId: savedUser.id },
    env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  const cookieStore = await cookies();
  cookieStore.set("token", token);
  const output: RegisterOutput = {
    token,
    user: relatedUser,
  };
  return output
}