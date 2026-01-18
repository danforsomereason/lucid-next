import authenticate from "@/utils/authenticate";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  // authentication
  const user = await authenticate();
  // authorization
  if (user?.role !== "admin") {
    throw new Error("Only admins can delete users.");
  }
  return NextResponse.json({ message: "User Deleted" });
}