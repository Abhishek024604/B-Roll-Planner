import React from "react";

export default function UploadPanel({ onRun, disabled }) {
  const [aRoll, setARoll] = React.useState(null);
  const [bRolls, setBRolls] = React.useState([]);

  const handleARollChange = (e) => {
    if (e.target.files[0]) {
      setARoll(e.target.files[0]);
    }
  };

  const handleBRollChange = (e) => {
    if (e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setBRolls((prev) => [...prev, ...newFiles]);
    }
    e.target.value = ""; // Reset to allow re-uploading same file
  };

  const removeBRoll = (index) => {
    setBRolls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <section className="upload-panel-container">
      
      {/* --- A-ROLL SECTION --- */}
      <div className="input-group">
        <h4 className="input-label">1. Main Video (A-Roll)</h4>
        <label className={`file-drop-zone ${aRoll ? 'active' : ''}`}>
          <input 
            type="file" 
            accept="video/*" 
            onChange={handleARollChange} 
            disabled={disabled}
          />
          <div className="zone-content">
            <span className="icon">{aRoll ? "✅" : "📁"}</span>
            <span className="text">
              {aRoll ? aRoll.name : "Click to Upload A-Roll"}
            </span>
          </div>
        </label>
      </div>

      {/* --- B-ROLL SECTION --- */}
      <div className="input-group">
        <h4 className="input-label">2. B-Rolls (Cutaways)</h4>
        <label className="file-drop-zone">
          <input 
            type="file" 
            accept="video/*" 
            multiple 
            onChange={handleBRollChange} 
            disabled={disabled}
          />
          <div className="zone-content">
            <span className="icon">🎞️</span>
            <span className="text">Add B-Roll Videos</span>
          </div>
        </label>

        {/* Selected Files List */}
        {bRolls.length > 0 && (
          <div className="file-list">
            <div className="file-list-header">
              <span>{bRolls.length} files selected</span>
              <button className="clear-btn" onClick={() => setBRolls([])}>Clear</button>
            </div>
            <ul>
              {bRolls.map((file, i) => (
                <li key={i}>
                  <span className="filename">{file.name}</span>
                  <button 
                    className="remove-btn" 
                    onClick={() => removeBRoll(i)}
                    title="Remove file"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* --- ACTION BUTTON --- */}
      <div className="action-area">
        <button
          className="generate-btn"
          onClick={() => onRun(aRoll, bRolls)}
          disabled={disabled || !aRoll || bRolls.length === 0}
        >
          {disabled ? "Processing..." : "✨ Generate Edit Plan"}
        </button>
      </div>

    </section>
  );
}