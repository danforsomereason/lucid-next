import { NextResponse } from "next/server";
import authenticate from "./authenticate";
import { ApiError } from "next/dist/server/api-utils";
import { RelatedAdminUser } from "@/types";

export default async function guardAuthAdmin (): Promise<RelatedAdminUser> {
  const auth = await authenticate()
  if (!auth) {
    throw new ApiError(401, 'Unauthorized')
  }
  if (
    auth.role !== 'super_admin' &&
    auth.role !== 'admin' &&
    auth.role !== 'instructor'
  ) {
    throw new ApiError(401, 'Unauthorized')
  }
  if (!auth.organizationId || !auth.organization) {
    throw new ApiError(401, 'Unauthorized')
  }
  const admin: RelatedAdminUser = {
    ...auth,
    organization: auth.organization,
    organizationId: auth.organizationId,
    role: auth.role,
  }
  return admin
}