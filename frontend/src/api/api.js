import { BACKEND_URL } from "../config/constants";

// SAFETY CHECK: Print the URL to the console so we can see if it's correct
console.log("API Configured with Backend URL:", BACKEND_URL);

export const uploadMedia = async (aRoll, bRolls) => {
  if (!BACKEND_URL) {
    throw new Error("BACKEND_URL is undefined! Check constants.js");
  }

  console.log("🚀 Uploading to:", `${BACKEND_URL}/upload`);
  
  const formData = new FormData();
  formData.append("a_roll", aRoll);
  
  // Safety check: Ensure bRolls is actually an array
  if (Array.isArray(bRolls)) {
    bRolls.forEach((b) => formData.append("b_rolls", b));
  } else {
    console.warn("bRolls is not an array!", bRolls);
  }

  const response = await fetch(`${BACKEND_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  
  return response.json();
};

export const generatePlan = async () => {
  console.log("🚀 Generating Plan at:", `${BACKEND_URL}/generate-plan`);
  
  const response = await fetch(`${BACKEND_URL}/generate-plan`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Generation failed: ${response.statusText}`);
  }

  return response.json();
};

export const fetchTranscript = async () => {
  const response = await fetch(`${BACKEND_URL}/transcript`);
  if (!response.ok) throw new Error("Transcript fetch failed");
  return response.json();
};

export const fetchBRollPlan = async () => {
  const response = await fetch(`${BACKEND_URL}/broll-plan`);
  if (!response.ok) throw new Error("Plan fetch failed");
  return response.json();
};