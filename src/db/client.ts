import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

let client: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle> | undefined;

export function getDatabase() {
  if (!process.env.DATABASE_URL) return null;
  client ??= postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
  database ??= drizzle(client);
  return database;
}
