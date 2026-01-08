import { execSync } from "child_process";
import fs from "fs";

export function extractAudio(aRollPath) {
  if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
  }

  const cmd = `ffmpeg -y -i ${aRollPath} -ac 1 -ar 16000 output/a_roll.wav`;
  execSync(cmd, { stdio: "inherit" });
}
