import React from "react";

export default function TranscriptView({ transcript }) {
  // Safety check
  if (!transcript || transcript.length === 0) 
    return (
      <div className="panel b-roll-panel">
        <div className="panel-header"><h3>🎬 Transcript Timeline</h3></div>
        <div className="empty-state">Waiting for Transcript generation...</div>
      </div>
    );


  return (
    <div className="panel">
      <div className="panel-header">
        <h3>📄 Transcript</h3>
        <span style={{ fontSize: '11px', color: '#666' }}>
          {transcript.length} Segments
        </span>
      </div>

      {/* ✅ FIX: Add 'list-container' class here to enable scrolling */}
      <div className="list-container">
        {transcript.map((t, i) => (
          <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            
            {/* Timestamp Column */}
            <div style={{ 
              color: '#3b82f6', 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              minWidth: '80px',
              marginTop: '2px' 
            }}>
              {formatTime(t.start_sec)} – {formatTime(t.end_sec)}
            </div>

            {/* Text Column */}
            <div style={{ color: '#e0e0e0', fontSize: '14px', lineHeight: '1.5' }}>
              {t.text}
            </div>
            
          </div>
        ))}
        {/* Spacer at bottom for easier scrolling */}
        <div style={{ height: '20px' }}></div> 
      </div>
    </div>
  );
}

// Helper function to make seconds look like 0:04
function formatTime(seconds) {
  if (seconds === undefined || seconds === null) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}