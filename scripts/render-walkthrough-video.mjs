import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const frameDir = path.join(root, "artifacts/docflow/public/video-frames");
const outputPath = path.join(root, "artifacts/docflow/public/walkthrough-video.mp4");
const filterPath = path.join(root, "artifacts/docflow/public/video-frames/walkthrough-filter.txt");

await mkdir(frameDir, { recursive: true });

const scenes = [
  ["00-title-card.png", 5],
  ["01-overview-card.png", 6],
  ["02-workspace-card.png", 6],
  ["03-create-card.png", 6],
  ["04-import-card.png", 6],
  ["05-editor-card.png", 6],
  ["06-typography-card.png", 7],
  ["07-share-card.png", 6],
  ["08-members-card.png", 6],
  ["09-filters-card.png", 6],
  ["10-handoff-card.png", 7],
  ["11-outro-card.png", 6],
];

const filters = [
  ...scenes.map((_, index) => `[${index}:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v${index}]`),
  `${scenes.map((_, index) => `[v${index}]`).join("")}concat=n=${scenes.length}:v=1:a=0[outv]`,
].join(";\n");

await writeFile(filterPath, filters);

const args = [
  "-y",
  ...scenes.flatMap(([file, duration]) => [
    "-loop",
    "1",
    "-t",
    String(duration),
    "-i",
    path.join(frameDir, file),
  ]),
  "-filter_complex_script",
  filterPath,
  "-map",
  "[outv]",
  "-movflags",
  "+faststart",
  "-pix_fmt",
  "yuv420p",
  outputPath,
];

const result = spawnSync("ffmpeg", args, { stdio: "inherit" });
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log(`Rendered ${outputPath}`);
