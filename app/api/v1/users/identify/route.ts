import authenticate from "@/utils/authenticate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate(true);
  return NextResponse.json({ user })
}