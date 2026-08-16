import { Db, UserFind } from "@/types";
import getUsers from "./getUsers";

export default async function getRelatedUsers (props: {
  db: Db
} & UserFind) {
  const { db, ...query } = props;
  const relatedQuery = {
    ...query,
    with: {
      ...props.with,
      organization: true
    }
  } satisfies UserFind;
  return getUsers(db, relatedQuery);
}
