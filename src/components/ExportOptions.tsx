import { useState, useEffect } from 'react';
import { downloadAllImages, downloadAsZip, shareAllImages, openImageInNewTab, generateFilename } from '../utils/exportUtils';
import { detectPlatform, canShareFiles } from '../utils/platformDetection';
import ExportInstructions from './ExportInstructions';
import './ExportOptions.css';

interface ExportOptionsProps {
  slides: string[];
  isGenerating?: boolean;
  showNumbers: boolean;
  onShowNumbersChange: (show: boolean) => void;
  title: string;
}

export default function ExportOptions({ 
  slides, 
  isGenerating,
  showNumbers,
  onShowNumbersChange,
  title
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<'individual' | 'zip' | 'share' | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const isIOS = platform === 'ios';
  const isAndroid = platform === 'android';
  const isMobile = isIOS || isAndroid;
  const canShare = canShareFiles();

  const handleExportIndividual = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportType('individual');
    
    try {
      downloadAllImages(slides, title);
      // Small delay to show feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show instructions on iOS after download
      if (isIOS) {
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting images. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleShareToPhotos = async () => {
    if (slides.length === 0 || !canShare) return;
    
    setIsExporting(true);
    setExportType('share');
    
    try {
      await shareAllImages(slides, title);
    } catch (error) {
      console.error('Share error:', error);
      alert('Error sharing images. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleOpenImage = (index: number) => {
    openImageInNewTab(slides[index]);
  };

  const handleExportZip = async () => {
    if (slides.length === 0) return;
    
    setIsExporting(true);
    setExportType('zip');
    
    try {
      await downloadAsZip(slides, title);
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
              {isIOS ? 'Downloading...' : 'Exporting...'}
            </>
          ) : (
            <>
              <span>📥</span>
              {isIOS ? 'Download Images' : 'Download Individual Images'}
            </>
          )}
        </button>

        {isAndroid && canShare && (
          <button
            type="button"
            onClick={handleShareToPhotos}
            disabled={isExporting || isGenerating}
            className="export-button export-share"
          >
            {isExporting && exportType === 'share' ? (
              <>
                <span className="spinner"></span>
                Sharing...
              </>
            ) : (
              <>
                <span>📤</span>
                Share to Photos
              </>
            )}
          </button>
        )}

        {!isMobile && (
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
        )}
      </div>

      {isIOS && showInstructions && (
        <ExportInstructions onClose={() => setShowInstructions(false)} />
      )}

      {isIOS && (
        <div className="ios-save-helper">
          <h3>Save to Photos (One by One)</h3>
          <div className="save-helper-grid">
            {slides.map((slide, index) => {
              const slideNumber = String(index + 1).padStart(2, '0');
              return (
                <div key={index} className="save-helper-item">
                  <div className="save-helper-image">
                    <img src={slide} alt={`Slide ${slideNumber}`} />
                    <span className="save-helper-number">{slideNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenImage(index)}
                    className="save-helper-btn"
                    disabled={isExporting || isGenerating}
                  >
                    Open Image
                  </button>
                </div>
              );
            })}
          </div>
          <p className="save-helper-note">
            Tap "Open Image" to view full-screen, then tap and hold to save to Photos.
          </p>
        </div>
      )}

      <div className="export-info">
        <p>Files will be named: <code>{generateFilename(0, title)}</code>, <code>{generateFilename(1, title)}</code>, etc.</p>
      </div>
    </div>
  );
}

