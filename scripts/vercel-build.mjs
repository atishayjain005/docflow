import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Provision a Postgres database (Neon or Vercel Postgres) and add DATABASE_URL to the Vercel project environment.",
  );
  process.exit(1);
}

const result = spawnSync(
  "pnpm",
  ["--filter", "@workspace/db", "run", "push"],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
