import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Provision a Postgres database (Neon or Vercel Postgres) and add DATABASE_URL to the Vercel project environment.",
  );
  process.exit(1);
}

if (process.env.VERCEL === "1") {
  console.log(
    "Skipping drizzle-kit push during Vercel build to avoid non-interactive schema prompts. Run `pnpm --filter @workspace/db run push` when schema changes.",
  );
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  ["--filter", "@workspace/db", "run", "push"],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
