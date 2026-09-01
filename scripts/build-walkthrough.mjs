import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "artifacts/docflow/dist/public/walkthrough");
const source = path.join(root, "artifacts/docflow/public/walkthrough/index.html");

await mkdir(target, { recursive: true });
await copyFile(source, path.join(target, "index.html"));
