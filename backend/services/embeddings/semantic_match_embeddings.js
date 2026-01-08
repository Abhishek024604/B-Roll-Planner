import fs from "fs";

// ---------- helpers ----------
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ---------- load data ----------
const aRoll = JSON.parse(
  fs.readFileSync("output/a_roll_embeddings.json", "utf-8")
);

const bRolls = JSON.parse(
  fs.readFileSync("output/b_roll_embeddings.json", "utf-8")
);

// ---------- intent embeddings ----------
const intentEmbeddings = JSON.parse(
  fs.readFileSync("services/embeddings/intent_embeddings.json", "utf-8")
);

const TOP_K = 3; //  controls fallback depth

const results = [];

// ---------- PURE SEMANTIC RANKING ----------
for (const segment of aRoll) {
  const intent =
    segment.intent && intentEmbeddings[segment.intent]
      ? segment.intent
      : "explanation";

  const intentVector = intentEmbeddings[intent];

  const scored = [];

  for (const b of bRolls) {
    let score = cosineSimilarity(segment.embedding, b.embedding);

    // intent soft alignment (allowed)
    const intentAlignment = cosineSimilarity(
      b.embedding,
      intentVector
    );

    score *= 1 + 0.3 * intentAlignment;

    scored.push({
      broll_id: b.id,
      score
    });
  }

  // sort descending
  scored.sort((a, b) => b.score - a.score);

  results.push({
    start_sec: segment.start_sec,
    end_sec: segment.end_sec,
    text: segment.text,
    intent: segment.intent,
    candidates: scored
      .slice(0, TOP_K)
      .map(c => ({
        broll_id: c.broll_id,
        similarity_score: Number(c.score.toFixed(3))
      }))
  });
}

// ---------- save ----------
fs.writeFileSync(
  "output/semantic_matches.json",
  JSON.stringify(results, null, 2)
);

console.log("Top-K semantic matching complete.");
