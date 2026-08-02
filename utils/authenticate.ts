import jwt from "jsonwebtoken";
import db from "../db";
import { eq } from "drizzle-orm";
import { usersTable } from "@/schema";
import { cookies } from "next/headers";
import { relatedUserSchema, tokenPayloadSchema } from "@/types";
import env from "@/env";
import guardRelatedUserById from "./getRelatedUserById";

function verify(token: string, debug?: boolean) {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
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
    console.debug("Authorization Token:", token);
  }
  if (!token) {
    if (debug) {
      console.debug("Authorization token missing");
    }
    return undefined;
  }
  const verified = verify(token, debug);
  if (debug) {
    console.debug("authenticate verified:", verified);
  }
  const payload = tokenPayloadSchema.parse(verified);
  if (!payload) {
    if (debug) {
      console.debug("Decoded empty token");
    }
    return undefined;
  }
  const user = await guardRelatedUserById({
    db, userId: payload.userId
  });
  if (debug) {
    console.debug('authenticate user', user)
  }
  if (!user) {
    throw new Error("User not found");
  }
  const parsed = relatedUserSchema.parse(user);
  return parsed;
}
