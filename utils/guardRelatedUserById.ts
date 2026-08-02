import { usersTable } from "@/schema";
import { Db } from "@/types";
import { eq } from "drizzle-orm";
import getRelatedUserById from "./getRelatedUserById";

export default async function guardRelatedUserById(props: {
  db: Db
  userId: string
}) {
  const user = await getRelatedUserById(props);
  if (!user) {
    const message = `User ${props.userId} not found`;
    throw new Error(message);
  }
  return user;
}