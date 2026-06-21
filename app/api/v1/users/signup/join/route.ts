import db from "@/db";
import { registerInputSchema, registerOutputSchema } from "@/types";
import createUser from "@/utils/createUser";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body: unknown = await request.json()
  const input = registerInputSchema.parse(body);

  const creation = await createUser({
    ...input,
    db,
    role: 'user',
    join: true,
  });

  const output = registerOutputSchema.parse(creation);
  return NextResponse.json(output)
}