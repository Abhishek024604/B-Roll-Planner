import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BROLL_DIR = "uploads/b_rolls";
const FRAME_DIR = "output/broll_frames";
const FFMPEG_PATH = `"C:/ffmpeg/bin/ffmpeg.exe"`;

// --- CLEAN derived data (CRITICAL) ---
if (fs.existsSync(FRAME_DIR)) {
  fs.rmSync(FRAME_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAME_DIR, { recursive: true });

// --- Process uploaded videos ---
const videos = fs.readdirSync(BROLL_DIR).filter(f => f.endsWith(".mp4"));

for (const video of videos) {
  const rawName = path.parse(video).name;

  // normalize ID (remove timestamp)
  const id = rawName.replace(/^\d+-/, "");
  const outDir = path.join(FRAME_DIR, id);

  fs.mkdirSync(outDir, { recursive: true });

  execSync(
    `${FFMPEG_PATH} -y -i "${path.join(BROLL_DIR, video)}" -vf "fps=0.5" "${outDir}/frame_%02d.jpg"`,
    { stdio: "ignore" }
  );

  console.log(`Frames extracted for ${id}`);
}
