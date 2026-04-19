import db from "@/db";
import { moduleProgressesTable } from "@/schema";
import { endModuleInputSchema } from "@/types";
import authenticate from "@/utils/authenticate";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await authenticate();
  if (!user) {
    return NextResponse.json({
      message: "You must be logged in to end a module",
    }, { status: 401 });
  }
  const body: unknown = await req.json();
  const input = endModuleInputSchema.parse(body);
  const condition = and(
    eq(moduleProgressesTable.moduleId, input.moduleId),
    eq(moduleProgressesTable.userId, user.id),
  )
  const existingProgress = await db.query.moduleProgressesTable.findFirst({
    where: condition
  });
  if (!existingProgress) {
    return NextResponse.json({ message: "Module progress not found" }, { status: 404 });
  }
  if (existingProgress.endModule) {
    return NextResponse.json({ message: "Module already completed" }, { status: 400 });
  }
  const [updated] = await db.update(moduleProgressesTable).set({
    endModule: new Date().toISOString(),
  }).where(condition).returning();

  return NextResponse.json(updated);
}