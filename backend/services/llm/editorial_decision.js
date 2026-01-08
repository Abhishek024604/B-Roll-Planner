import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Decide whether B-roll should be inserted at this moment
 */
export async function shouldInsertBroll({ text, intent, brollMeta }) {
  const prompt = `
You are a professional video editor.

Spoken segment:
"${text}"

Segment intent:
"${intent}"

Candidate B-roll meaning:
"${brollMeta}"

Question:
Would inserting this B-roll ADD clarity or impact,
or would it distract from the spoken message , don't be too strict as our final goal is making video engaging and brolls can play important role ?

Answer ONLY in JSON:

{
  "insert": true | false,
  "confidence": "low | medium | high"
}
`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt
  });

  const raw = res.text.replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}
