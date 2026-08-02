import db from "@/db";
import { usersTable } from "@/schema";
import { upgradeUserInputSchema, UpgradeUserOutput, upgradeUserOutputSchema } from "@/types";
import guardRelatedUserById from "@/utils/guardRelatedUserById";
import guardAuthAdmin from "@/utils/guardAuthAdmin";
import handleApiError from "@/utils/handleApiError";
import { eq } from "drizzle-orm";
import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = await guardAuthAdmin()
    const body: unknown = await req.json()
    const input = upgradeUserInputSchema.parse(body)

    const condition = eq(usersTable.id, input.userId)
    const user = await db.query.usersTable.findFirst({
      where: condition,
    });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.organizationId !== auth.organizationId) {
      throw new ApiError(403, "User does not belong to your organization");
    }
    if (user.role === 'super_admin' ) {
      throw new ApiError(403, "User is already a super admin");
    }
    if (user.role === 'instructor' ) {
      throw new ApiError(403, "User is already an instructor");
    }

    await db.update(usersTable).set({
      role: 'instructor',
    }).where(condition)
    const relatedUser: UpgradeUserOutput = await guardRelatedUserById({
      db,
      userId: input.userId,
    });
    const output = upgradeUserOutputSchema.parse(relatedUser);
    return NextResponse.json(output);
  } catch (error) {
    return handleApiError(error);
  }
}