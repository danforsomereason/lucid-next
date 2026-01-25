import jwt from "jsonwebtoken";
import db from "../db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/schema";
import { cookies } from "next/headers";
import { userSchema } from "@/types";

function verify(token: string, debug?: boolean) {
  try {
    const decoded = jwt.verify(token, "TEST_SECRET");
    return decoded;
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    return undefined;
  }
}

export default async function authenticate(
  debug?: boolean
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (debug) {
    console.debug("token:", token);
  }
  if (!token) {
    if (debug) {
      console.debug("token missing");
    }
    return undefined;
  }
  const decoded = verify(token, debug);
  if (debug) {
    console.debug("Decoded at authenticate fx:", decoded);
  }
  if (!decoded) {
    if (debug) {
      console.debug("Decoded empty token");
    }
    return undefined;
  }

  if (typeof decoded !== "object") {
    throw new Error("Decoded is not an object");
  }

  const userId = (decoded as { userId: string }).userId;
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId)
  });
  if (!user) {
    throw new Error("User not found");
  }
  const parsed = userSchema.parse(user);
  return parsed;
}
