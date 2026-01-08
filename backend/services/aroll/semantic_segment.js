import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY 
});

// Load Whisper transcript
const transcript = JSON.parse(
  fs.readFileSync("output/a_roll_transcript.json", "utf-8")
);

// Build prompt-friendly transcript
const transcriptText = transcript
  .map(t => `[${t.start_sec} - ${t.end_sec}] ${t.text}`)
  .join("\n");

// Utility: extract JSON array safely
function extractJSONArray(text) {
  text = text.replace(/```json|```/g, "").trim();
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) {
    throw new Error("No JSON array found in LLM output");
  }
  return JSON.parse(text.slice(start, end + 1));
}

// Utility: validate one segment
function validateSegment(s) {
  if (
    typeof s.start_sec !== "number" ||
    typeof s.end_sec !== "number" ||
    typeof s.text !== "string"
  ) {
    throw new Error("Invalid segment schema from LLM");
  }

  return {
    start_sec: s.start_sec,
    end_sec: s.end_sec,
    text: s.text,
    intent: s.intent || "explanation"
  };
}

async function segmentTranscript() {
  const prompt = `
You are an expert video editor.

Group transcript lines into idea-level segments.

Rules:
- Do NOT invent new content
- Preserve original timestamps
- Assign one intent label per segment:
  [introduction, problem, explanation, advice, conclusion]

Return ONLY a JSON array in this exact format:

[
  {
    "start_sec": number,
    "end_sec": number,
    "text": string,
    "intent": "introduction | problem | explanation | advice | conclusion"
  }
]

Transcript:
${transcriptText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  const rawSegments = extractJSONArray(response.text);

  if (!Array.isArray(rawSegments) || rawSegments.length === 0) {
    throw new Error("Empty segmentation output");
  }

  const normalized = rawSegments.map(validateSegment);

  fs.writeFileSync(
    "output/a_roll_segmented.json",
    JSON.stringify(normalized, null, 2)
  );

  console.log("Semantic segmentation complete.");
}

segmentTranscript();
