import { usersTable } from "@/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import db from "../db";
import verify from "./verify";

export default async function getAuthUser( 
  debug?: boolean
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (debug) {
    console.debug("Authorization Token:", token);
  }
  if (!token) {
    if (debug) {
      console.debug("Authorization token missing");
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
  return user
}
