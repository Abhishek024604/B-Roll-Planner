import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const segments = JSON.parse(
  fs.readFileSync("output/a_roll_segmented.json", "utf-8")
);

async function run() {
  const prompt = `
You are an expert video editor.

Below is a spoken A-roll segmented by ideas.
Summarize the OVERALL MESSAGE and NARRATIVE PURPOSE of this video
in 4-5 sentences.

Do NOT add new information.

A-roll:
${segments.map(s => `- ${s.text}`).join("\n")}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  fs.writeFileSync(
    "output/aroll_context.txt",
    res.text.trim()
  );

  console.log("A-roll narrative context created.");
}

run();
