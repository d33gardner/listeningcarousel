import { useState } from 'react';
import { downloadAllImages, downloadAsZip } from '../utils/exportUtils';
import './ExportOptions.css';

interface ExportOptionsProps {
  slides: string[];
  isGenerating?: boolean;
  showNumbers: boolean;
  onShowNumbersChange: (show: boolean) => void;
}

export default function ExportOptions({ 
  slides, 
  isGenerating,
  showNumbers,
  onShowNumbersChange
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'individual' | 'zip' | null>(null);

  const handleExportIndividual = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportType('individual');
    
    try {
      downloadAllImages(slides);
      // Small delay to show feedback
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting images. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleExportZip = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportType('zip');
    
    try {
      await downloadAsZip(slides);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error creating ZIP file. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  if (slides.length === 0) {
    return (
      <div className="export-options">
        <h2>Step 5: Export</h2>
        <div className="export-disabled">
          <p>Generate your carousel first to export.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="export-options">
      <h2>Step 5: Export ({slides.length} slides)</h2>
      
      <div className="export-buttons">
        <button
          type="button"
          onClick={handleExportIndividual}
          disabled={isExporting || isGenerating}
          className="export-button export-individual"
        >
          {isExporting && exportType === 'individual' ? (
            <>
              <span className="spinner"></span>
              Exporting...
            </>
          ) : (
            <>
              <span>📥</span>
              Download Individual Images
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleExportZip}
          disabled={isExporting || isGenerating}
          className="export-button export-zip"
        >
          {isExporting && exportType === 'zip' ? (
            <>
              <span className="spinner"></span>
              Creating ZIP...
            </>
          ) : (
            <>
              <span>📦</span>
              Download as ZIP
            </>
          )}
        </button>
      </div>

      <div className="export-options-controls">
        <label className="export-checkbox-label">
          <input
            type="checkbox"
            checked={showNumbers}
            onChange={(e) => onShowNumbersChange(e.target.checked)}
            disabled={isGenerating}
          />
          <span>Show numbered circles (for testing)</span>
        </label>
      </div>

      <div className="export-info">
        <p>Files will be named: <code>carousel_01.jpg</code>, <code>carousel_02.jpg</code>, etc.</p>
      </div>
    </div>
  );
}

