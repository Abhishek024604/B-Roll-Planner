from sentence_transformers import SentenceTransformer
import sys
import json

model = SentenceTransformer("all-MiniLM-L6-v2")

input_path = sys.argv[1]
output_path = sys.argv[2]

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

texts = []
records = []

for item in data:
    if "text" in item:
        texts.append(item["text"])
        records.append(item)
    elif "metadata" in item:
        texts.append(item["metadata"])
        records.append(item)
    else:
        raise ValueError("No text or metadata field found for embedding")

embeddings = model.encode(texts, normalize_embeddings=True)

output = []

for i, record in enumerate(records):
    output.append({
        **record,
        "embedding": embeddings[i].tolist()
    })

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Embeddings generated successfully.")
