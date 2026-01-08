import express from "express";
import multer from "multer";
import fs from "fs";
import { generatePlan } from "../controllers/planController.js";

const router = express.Router();

// Upload dirs
const aRollDir = "uploads/a_roll";
const bRollDir = "uploads/b_rolls";

[aRollDir, bRollDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "a_roll") cb(null, aRollDir);
    else if (file.fieldname === "b_rolls") cb(null, bRollDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

function cleanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    fs.unlinkSync(`${dir}/${file}`);
  });
}

// Upload
router.post(
  "/upload",
  (req, res, next) => {
    // 🔥 CLEAN previous uploads (important)
    cleanDirectory(aRollDir);
    cleanDirectory(bRollDir);
    next();
  },
  upload.fields([
    { name: "a_roll", maxCount: 1 },
    { name: "b_rolls", maxCount: 10 }
  ]),
  (req, res) => {
    if (!req.files?.a_roll) {
      return res.status(400).json({ error: "A-roll is required" });
    }

    res.json({ message: "Files uploaded successfully" });
  }
);


// Generate plan
router.post("/generate-plan", generatePlan);

// Fetch transcript
router.get("/transcript", (req, res) => {
  try {
    const data = fs.readFileSync("output/a_roll_transcript.json", "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: "Transcript not found" });
  }
});

// Fetch plan
router.get("/broll-plan", (req, res) => {
  try {
    const data = fs.readFileSync("output/final_timeline_plan.json", "utf-8");
    res.json(JSON.parse(data));
  } catch {
    res.status(404).json({ error: "B-roll plan not found" });
  }
});

export default router;
