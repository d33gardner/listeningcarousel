import { useState } from 'react';
import './ExportInstructions.css';

interface ExportInstructionsProps {
  onClose: () => void;
}

export default function ExportInstructions({ onClose }: ExportInstructionsProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  if (!showInstructions) {
    return (
      <div className="export-instructions-toggle">
        <button
          type="button"
          onClick={() => setShowInstructions(true)}
          className="instructions-toggle-btn"
        >
          📱 Show Save Instructions
        </button>
      </div>
    );
  }

  return (
    <div className="export-instructions">
      <div className="instructions-header">
        <h3>📱 How to Save to Photos</h3>
        <button
          type="button"
          onClick={() => setShowInstructions(false)}
          className="instructions-close"
          aria-label="Hide instructions"
        >
          ✕
        </button>
      </div>
      <div className="instructions-content">
        <ol className="instructions-steps">
          <li>
            <strong>Tap and hold</strong> on any image below
          </li>
          <li>
            Select <strong>"Save Image"</strong> or <strong>"Add to Photos"</strong>
          </li>
          <li>
            Repeat for each image you want to save
          </li>
        </ol>
        <p className="instructions-note">
          💡 Tip: You can also use the "Open Image" button below each slide to view it full-screen, then save it.
        </p>
      </div>
    </div>
  );
}

