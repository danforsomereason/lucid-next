import db from "@/db";
import { usersTable } from "@/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ email: string }> }
) {
  const params = await context.params;
  try {
    const existingUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, params.email),
    });
    return NextResponse.json({
      exists: !!existingUser,
    });
  } catch (error) {
    console.error("Error checking user:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}