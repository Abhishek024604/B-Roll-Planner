import React from "react";
import UploadPanel from "./components/UploadPanel";
import TranscriptView from "./components/TranscriptView";
import BRollPlanView from "./components/BRollPlanView";
import { uploadMedia, generatePlan, fetchTranscript, fetchBRollPlan } from "./api/api.js";
import "./App.css"; // Ensure this contains the dark mode CSS I gave you

export default function App() {
  // --- 1. YOUR LOGIC (Perfect, Keep this exactly as is) ---
  const [transcript, setTranscript] = React.useState([]);
  const [plan, setPlan] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const runPipeline = async (aRoll, bRolls) => {
    setLoading(true);
    setError(null);
    setTranscript([]);
    setPlan([]);

    try {
      console.log("Step 1: Uploading...");
      await uploadMedia(aRoll, bRolls);

      console.log("Step 2: Generating Plan...");
      await generatePlan();

      console.log("Step 3: Fetching Results...");
      const transcriptData = await fetchTranscript();
      const planData = await fetchBRollPlan();

      // Data unwrapping logic
      const cleanPlan = planData.insertions || planData;
      const cleanTranscript = Array.isArray(transcriptData) 
        ? transcriptData 
        : (transcriptData.transcript || []);

      if (Array.isArray(cleanTranscript)) setTranscript(cleanTranscript);
      else setError("Failed to load transcript format.");

      if (Array.isArray(cleanPlan)) setPlan(cleanPlan);
      else setError("Failed to load plan format.");

    } catch (err) {
      console.error("Pipeline Error:", err);
      setError("An error occurred. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. THE UI UPDATE (Change this part!) ---
  return (
    <div className="app-container">
      
      {/* LEFT SIDEBAR: Controls & Uploads */}
      <aside className="sidebar">
        <div className="brand">
          <h2 style={{fontSize: '30px', color: '#ef43b2ff', marginTop: '5px'}}>AutoEdit Pro</h2>
          <p style={{fontSize: '12px', color: '#4cc138ff', marginTop: '5px'}}>
               AI B-Roll Composer
          </p>
        </div>

        {/* Pass loading state to disable buttons while running */}
        <UploadPanel onRun={runPipeline} disabled={loading} />
        
        {loading && (
          <div style={{ marginTop: 20, textAlign: 'center', color: '#007acc' }}>
            <p>Processing Media...</p>
            <small style={{color: '#666'}}>This may take a minute.</small>
          </div>
        )}

        {error && (
          <div style={{ 
            marginTop: 20, 
            padding: 10, 
            background: 'rgba(244, 67, 54, 0.1)', 
            border: '1px solid #f44336', 
            borderRadius: 4, 
            color: '#f44336',
            fontSize: '13px'
          }}>
            ⚠️ {error}
          </div>
        )}
      </aside>

      {/* RIGHT MAIN STAGE: The "Editor" View */}
      <main className="main-stage">
        
        {/* Panel 1: Script/Transcript */}
        <TranscriptView transcript={transcript} />

        {/* Panel 2: B-Roll Timeline */}
        <BRollPlanView plan={plan} />
        
      </main>
    </div>
  );
}