import db from "@/db";
import { usersTable, verifiedUsersTable } from "@/schema";
import { VerifiedUserInsert, verifyUserInputSchema } from "@/types";
import guardAuthAdmin from "@/utils/guardAuthAdmin";
import handleApiError from "@/utils/handleApiError";
import { eq } from "drizzle-orm";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async  function POST (request: Request) {
  try {
    const auth = await guardAuthAdmin()
    const body: unknown = await request.json()
    const input = verifyUserInputSchema.parse(body)

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, input.email),
    });
    if (user) {
      throw new ApiError(400, "User already exists");
    }

    const values: VerifiedUserInsert = {
      email: input.email,
      organizationId: auth.organizationId,
    };

    const [verifiedUser] = await db
      .insert(verifiedUsersTable)
      .values(values)
      .returning();

    if (!verifiedUser) {
      throw new ApiError(500, "Failed to create verified user");
    }

    return NextResponse.json(verifiedUser);
  } catch (error) {
    return handleApiError(error);
  }
}