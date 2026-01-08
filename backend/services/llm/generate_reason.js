import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { shouldInsertBroll } from "./editorial_decision.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// read candidates (NOT final timeline)
const data = JSON.parse(
  fs.readFileSync("output/editorial_candidates.json", "utf-8")
);

const candidates = data.candidates;

const brolls = JSON.parse(
  fs.readFileSync("services/broll/brollMetadata.json", "utf-8")
);

function getMeta(id) {
  return brolls.find(b => b.id === id)?.metadata || "";
}

async function generateReason(text, meta) {
  const prompt = `
You are explaining a video editing decision.

Spoken content:
"${text}"

Selected B-roll meaning:
"${meta}"

Explain in ONE natural sentence
why this visual was chosen at this moment.
Do not give advice. Be concise and human.
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt
  });

  return res.text.trim();
}

async function run() {
  const finalInsertions = [];

  for (const c of candidates) {
    const meta = getMeta(c.broll_id);

    // 1️⃣ EDITORIAL JUDGMENT
    const decision = await shouldInsertBroll({
      text: c.text,
      intent: c.intent,
      brollMeta: meta
    });

    if (!decision.insert) continue;

    // 2️⃣ REASON (only if approved)
    const reason = await generateReason(c.text, meta);

    finalInsertions.push({
      start_sec: c.start_sec,
      duration_sec: c.duration_sec,
      broll_id: c.broll_id,
      confidence: c.confidence,
      reason
    });
  }

  fs.writeFileSync(
    "output/final_timeline_plan.json",
    JSON.stringify({ insertions: finalInsertions }, null, 2)
  );

  console.log("Final editorial timeline generated with judgment.");
}

run();
