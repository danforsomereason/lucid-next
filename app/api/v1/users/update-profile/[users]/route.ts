import db from "@/db";
import { usersTable } from "@/schema";
import { userProfileUpdateInputSchema, userProfileUpdateOutputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(
  request: Request, 
  context: { params: { users: string } }
) {
  const user = await authenticate();
  const body: unknown = await request.json()
  const input = userProfileUpdateInputSchema.parse(body);
  // authorization:
  if (user?.id !== context.params.users) {
    throw new Error("You can only update your own profile.");
  }
  // Behavior: update user profile
  const [updatedUser] = await db
    .update(usersTable)
    .set(input)
    .where(eq(usersTable.id, user.id)) // where always returns an array
    .returning();
  const output = userProfileUpdateOutputSchema.parse(updatedUser);
  return NextResponse.json(output);
}