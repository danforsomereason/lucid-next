import db from "@/db";
import { verifiedUsersTable } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: { email: string } }) {
  try {
    const verifiedUser = await db.query.verifiedUsersTable.findFirst({
      where: eq(verifiedUsersTable.email, context.params.email),
    });
    return NextResponse.json({
      exists: !!verifiedUser,
      organizationId: verifiedUser?.organizationId || null,
    });
  } catch (error) {
    console.error("Error checking verification:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}