import { ApiError } from "next/dist/server/api-utils";
import { NextResponse } from "next/server";

export default function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { message: error.message },
      { status: error.statusCode }
    );
  }
  if (error instanceof Error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { message: "Unknown error" },
    { status: 500 }
  );
}