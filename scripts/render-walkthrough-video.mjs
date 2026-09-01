import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const frameDir = path.join(root, "artifacts/docflow/public/video-frames");
const outputPath = path.join(root, "artifacts/docflow/public/walkthrough-video.mp4");
const filterPath = path.join(root, "artifacts/docflow/public/video-frames/walkthrough-filter.txt");

await mkdir(frameDir, { recursive: true });

const filters = [
  "[0:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v0]",
  "[1:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v1]",
  "[2:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v2]",
  "[3:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v3]",
  "[4:v]scale=1280:720,setsar=1,fps=30,format=yuv420p[v4]",
  "[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[outv]",
].join(";\n");

await writeFile(filterPath, filters);

const args = [
  "-y",
  "-loop",
  "1",
  "-t",
  "4",
  "-i",
  path.join(frameDir, "00-title.png"),
  "-loop",
  "1",
  "-t",
  "5",
  "-i",
  path.join(frameDir, "01-workspace-card.png"),
  "-loop",
  "1",
  "-t",
  "5",
  "-i",
  path.join(frameDir, "02-editor-card.png"),
  "-loop",
  "1",
  "-t",
  "5",
  "-i",
  path.join(frameDir, "03-share-card.png"),
  "-loop",
  "1",
  "-t",
  "5",
  "-i",
  path.join(frameDir, "04-outro.png"),
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
