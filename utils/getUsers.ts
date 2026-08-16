import database from "@/db";
import { UserFind } from "@/types";

type UsersQuery<T extends UserFind> = ReturnType<
  typeof database.query.usersTable.findMany<T>
>;

export default function getUsers<T extends UserFind>(
  db: Pick<typeof database, "query">,
  query: T & Parameters<typeof database.query.usersTable.findMany<T>>[0]
): UsersQuery<T> {
  return db.query.usersTable.findMany<T>(query);
}
