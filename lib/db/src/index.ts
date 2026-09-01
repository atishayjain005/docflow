import { drizzle } from "drizzle-orm/node-postgres";
import pg, { type PoolConfig } from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function createPoolConfig(connectionString: string): PoolConfig {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode");

  if (!sslMode) {
    return { connectionString };
  }

  url.searchParams.delete("sslmode");

  return {
    connectionString: url.toString(),
    ssl: sslMode === "disable" ? false : { rejectUnauthorized: true },
  };
}

export const pool = new Pool(createPoolConfig(process.env.DATABASE_URL));
export const db = drizzle(pool, { schema });

export * from "./schema";
