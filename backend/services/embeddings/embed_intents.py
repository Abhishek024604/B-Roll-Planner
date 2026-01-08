from sentence_transformers import SentenceTransformer
import json

model = SentenceTransformer("all-MiniLM-L6-v2")

intent_anchors = {
  "introduction": "An opening statement that sets context, introduces the topic, or captures        attention without presenting a problem yet.",
  "problem": "A statement describing a risk, issue, negative condition, or concern that affects people or situations.",
  "explanation": "Neutral background information that explains causes, context, or facts without judgment or instruction.",
  "advice": "A recommendation, suggestion, or guidance on what actions to take or what choices are better.",
  "conclusion": "A closing thought that summarizes, reflects on, or reinforces the main message of the video."
}

embeddings = {
    k: model.encode(v, normalize_embeddings=True).tolist()
    for k, v in intent_anchors.items()
}

with open("services/embeddings/intent_embeddings.json", "w") as f:
    json.dump(embeddings, f, indent=2)

print("Intent embeddings created.")
