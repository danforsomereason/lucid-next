import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import env from "./env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle({
  client: pool,
  schema,
});

export default db;