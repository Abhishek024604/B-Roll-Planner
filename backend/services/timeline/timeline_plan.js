import fs from "fs";

const matches = JSON.parse(
  fs.readFileSync("output/semantic_matches.json", "utf-8")
);

const usedBrolls = new Set();

const INTENT_CONFIDENCE_THRESHOLD = {
  introduction: 0.40,
  problem: 0.35,
  advice: 0.35,
  explanation: 0.40,
  conclusion: 0.45
};

const candidates = [];

for (const segment of matches) {
  if (!segment.candidates || segment.candidates.length === 0) continue;

  const intent = segment.intent || "explanation";
  const minConfidence =
    INTENT_CONFIDENCE_THRESHOLD[intent] ?? 0.35;

  // 🔑 PICK FIRST UNUSED SEMANTICALLY VALID B-ROLL
  const choice = segment.candidates.find(
    c =>
      !usedBrolls.has(c.broll_id) &&
      c.similarity_score >= minConfidence
  );

  if (!choice) continue;

  const duration = Math.min(3, segment.end_sec - segment.start_sec).toFixed(3);
  if (duration < 1.5) continue;

  usedBrolls.add(choice.broll_id);

  candidates.push({
    start_sec: segment.start_sec,
    end_sec: segment.end_sec,
    duration_sec: duration,
    broll_id: choice.broll_id,
    confidence: choice.similarity_score,
    intent,
    text: segment.text
  });
}

fs.writeFileSync(
  "output/editorial_candidates.json",
  JSON.stringify({ candidates }, null, 2)
);

console.log("Editorial candidate selection with fallback complete.");
