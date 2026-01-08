import fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const FRAME_DIR = "output/broll_frames";
const OUTPUT_FILE = "services/broll/brollMetadata.json";

// A-roll narrative context (already generated)
const AROLL_CONTEXT = fs.readFileSync(
  "output/aroll_context.txt",
  "utf-8"
);

/**
 * ONE LLM call per B-roll
 * All frames passed together
 */
async function generateMetadataForBroll(frames, arollContext) {
  const imageParts = frames.map(framePath => ({
    inlineData: {
      mimeType: "image/jpeg",
      data: fs.readFileSync(framePath, { encoding: "base64" })
    }
  }));

  const prompt = `
You are assisting an expert video editor.

The A-roll story context is:
"${arollContext}"

Below are multiple frames from ONE B-roll video.

TASK:
Describe what this B-roll REPRESENTS in the context of the A-roll. Dont be too strict about the context. Act like a human that sees and analyses everything.Just develop a story in your mind using A-roll context and then analyse B-roll about how these can add value to the final video when added during editing.

Focus on:
- the implied meaning or mood with a balance of visuals.
- observe carefully and try to use keywords during description.
- how it could be editorially useful.
- pay close attention to the objects and surroundings which are is somewhat relation to the narrative

Do NOT:
- describe frames individually
- invent story events

Return ONE abstract, reusable description in 20-30 words.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, ...imageParts]
      }
    ]
  });

  return response.text.trim();
}

async function run() {
  const brollIds = fs.readdirSync(FRAME_DIR);
  const output = [];

  for (const id of brollIds) {
    const frameDir = path.join(FRAME_DIR, id);

    const frames = fs
      .readdirSync(frameDir)
      .filter(f => f.endsWith(".jpg"))
      .slice(0, 6) // limit frames defensively
      .map(f => path.join(frameDir, f));

    if (frames.length === 0) continue;

    const metadata = await generateMetadataForBroll(
      frames,
      AROLL_CONTEXT
    );

    output.push({ id, metadata });

    console.log(`Context-aware metadata generated for ${id}`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log("B-roll metadata generation complete (batched frames).");
}

run();
