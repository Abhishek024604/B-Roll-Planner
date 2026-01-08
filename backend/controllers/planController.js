import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const generatePlan = (req, res) => {
  try {
    console.log("Starting B-roll plan generation pipeline...");

    // --- Resolve A-roll video path ---
    const aRollDir = path.join("uploads", "a_roll");
    const aRollFiles = fs.readdirSync(aRollDir).filter(f => f.endsWith(".mp4"));

    if (aRollFiles.length === 0) {
      throw new Error("No A-roll video found");
    }

    const aRollPath = path.join(aRollDir, aRollFiles[0]);

    // --- Ensure output folder ---
    if (!fs.existsSync("output")) {
      fs.mkdirSync("output");
    }

    // --- Absolute ffmpeg path (Windows-safe) ---
    const FFMPEG_PATH = `"C:/ffmpeg/bin/ffmpeg.exe"`; 
    // ⚠️ change this if your ffmpeg is elsewhere

    // 1. Extract audio
    execSync(
      `${FFMPEG_PATH} -y -i "${aRollPath}" -ac 1 -ar 16000 output/a_roll.wav`,
      { stdio: "inherit" }
    );

    // 2. Transcribe
    execSync(`python services/aroll/transcribe.py`, { stdio: "inherit" });

    // 3. Prepare transcript
    execSync(`node services/aroll/semantic_segment.js`, { stdio: "inherit" });

    // 3.5 Build A-roll narrative context
    execSync(`node services/broll/build_aroll_context.js`, { stdio: "inherit" });

// 3.6 Extract B-roll frames 
    execSync(`node services/broll/extract_frames.js`, { stdio: "inherit" });

// 3.7 Generate context-aware B-roll metadata
    execSync(`node services/broll/generate_metadata.js`, { stdio: "inherit" });

    // 4. Embeddings
    execSync(
      `python services/embeddings/embed_text.py output/a_roll_segmented.json output/a_roll_embeddings.json`,
      { stdio: "inherit" }
    );

    execSync(
      `python services/embeddings/embed_text.py services/broll/brollMetadata.json output/b_roll_embeddings.json`,
      { stdio: "inherit" }
    );

    // 5. Semantic matching
    execSync(
      `node services/embeddings/semantic_match_embeddings.js`,
      { stdio: "inherit" }
    );

    // 6. TIMELINE PLANNING (EDITORIAL CANDIDATES)
    execSync(
      `node services/timeline/timeline_plan.js`,
      { stdio: "inherit" }
    );

    // 7. LLM reasoning
    execSync(
      `node services/llm/generate_reason.js`,
      { stdio: "inherit" }
    );

    if (!fs.existsSync("output/final_timeline_plan.json")) {
       return res.json({ insertions: [] });
    }


    // 8. Respond
    const timeline = JSON.parse(
      fs.readFileSync("output/final_timeline_plan.json", "utf-8")
    );

    res.json({
      insertions: timeline.insertions
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
