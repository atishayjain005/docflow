import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const videoDist = path.join(root, "artifacts/docflow-video/dist/public");
const target = path.join(root, "artifacts/docflow/dist/public/walkthrough");

const result = spawnSync(
  "pnpm",
  ["--filter", "@workspace/docflow-video", "run", "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CI: "true",
      npm_config_confirm_modules_purge: "false",
      PORT: "25804",
      BASE_PATH: "/walkthrough/",
    },
  },
);

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

await rm(target, { recursive: true, force: true });
await cp(videoDist, target, { recursive: true });
