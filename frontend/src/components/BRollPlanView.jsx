import React from "react";

export default function BRollPlanView({ plan }) {
  // Safety check
  if (!plan || !Array.isArray(plan) || plan.length === 0) {
    return (
      <div className="panel b-roll-panel">
        <div className="panel-header"><h3>🎬 B-Roll Timeline</h3></div>
        <div className="empty-state">Waiting for B-plan generation...</div>
      </div>
    );
  }

  return (
    <div className="panel b-roll-panel">
      <div className="panel-header">
        <h3>🎬 B-Roll Timeline</h3>
        <span className="badge">{plan.length} Cuts</span>
      </div>

      <div className="list-container">
        {plan.map((item, index) => {
          // --- 1. DATA MAPPING ---
          const start = item.start_sec;
          const duration = item.duration_sec;
          const id = item.broll_id;
          const reason = item.reason;
          const confidence = item.confidence;

          // Calculate End Time
          const endTime = (parseFloat(start) + parseFloat(duration)).toFixed(1);
          const percent = (confidence * 100).toFixed(0);

          return (
            // ✅ FIX: Use 'clip-card' class to trigger the side-by-side layout
            <div key={index} className="clip-card">
              
              {/* LEFT COLUMN: Time */}
              <div className="clip-time-box">
                <div className="time-start">{formatTime(start)}</div>
                <div className="time-arrow">⬇</div>
                <div className="time-end">{formatTime(endTime)}</div>
                <div className="duration-pill">{duration}s</div>
              </div>

              {/* CENTER COLUMN: Info */}
              <div className="clip-info">
                <div className="clip-header">
                  <span className="icon">📼</span>
                  <span className="clip-id">{id}</span>
                </div>
                <div className="clip-reason">
                  "{reason}"
                </div>
              </div>

              {/* RIGHT COLUMN: Score */}
              <div className="clip-score">
                <div className="score-label">AI Match</div>
                <div className="score-val" style={{ color: getScoreColor(confidence) }}>
                  {percent}%
                </div>
              </div>

            </div>
          );
        })}
        {/* Spacer for scrolling */}
        <div style={{ height: '50px' }}></div>
      </div>
    </div>
  );
}

// Color helper
function getScoreColor(score) {
  if (score >= 0.7) return '#4caf50'; // Green
  if (score >= 0.4) return '#ff9800'; // Orange
  return '#f44336'; // Red
}

// Time helper
function formatTime(seconds) {
  const s = parseFloat(seconds);
  if (isNaN(s)) return "00:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}