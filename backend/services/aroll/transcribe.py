from faster_whisper import WhisperModel
import json
import os

model = WhisperModel("small", device="cpu")

segments, info = model.transcribe(
    "output/a_roll.wav",
    task="translate"
)

output = []

for segment in segments:
    output.append({
        "start_sec": round(segment.start, 2),
        "end_sec": round(segment.end, 2),
        "text": segment.text.strip()
    })

with open("output/a_roll_transcript.json", "w", encoding="utf-8") as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("Transcription complete.")
