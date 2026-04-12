import authenticate from "@/utils/authenticate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await authenticate();
  return NextResponse.json({ user })
}