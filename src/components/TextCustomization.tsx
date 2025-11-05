import type { TextCustomization } from '../types';
import './TextCustomization.css';

interface TextCustomizationProps {
  customization: TextCustomization;
  onCustomizationChange: (customization: TextCustomization) => void;
}

export default function TextCustomization({
  customization,
  onCustomizationChange,
}: TextCustomizationProps) {
  const handleFontStyleChange = (fontStyle: 'modern' | 'classic' | 'bold') => {
    onCustomizationChange({ ...customization, fontStyle });
  };

  const handleTextColorChange = (color: string) => {
    onCustomizationChange({ ...customization, textColor: color });
  };

  const handlePositionChange = (position: 'top' | 'center' | 'bottom') => {
    onCustomizationChange({ ...customization, textPosition: position });
  };

  const handleOverlayToggle = () => {
    onCustomizationChange({
      ...customization,
      backgroundOverlay: !customization.backgroundOverlay,
    });
  };

  const handleOpacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCustomizationChange({
      ...customization,
      overlayOpacity: parseFloat(event.target.value),
    });
  };

  const handleOutlineWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCustomizationChange({
      ...customization,
      outlineWidth: parseInt(event.target.value, 10),
    });
  };

  return (
    <div className="text-customization">
      <h2>Step 3: Customize Appearance</h2>
      
      <div className="customization-grid">
        <div className="customization-group">
          <label>Font Style</label>
          <div className="button-group">
            <button
              type="button"
              className={customization.fontStyle === 'modern' ? 'active' : ''}
              onClick={() => handleFontStyleChange('modern')}
            >
              Modern
            </button>
            <button
              type="button"
              className={customization.fontStyle === 'classic' ? 'active' : ''}
              onClick={() => handleFontStyleChange('classic')}
            >
              Classic
            </button>
            <button
              type="button"
              className={customization.fontStyle === 'bold' ? 'active' : ''}
              onClick={() => handleFontStyleChange('bold')}
            >
              Bold
            </button>
          </div>
        </div>

        <div className="customization-group">
          <label>Text Color</label>
          <div className="color-group">
            <button
              type="button"
              className={`color-button ${customization.textColor === '#FFFFFF' ? 'active' : ''}`}
              onClick={() => handleTextColorChange('#FFFFFF')}
              style={{ backgroundColor: '#FFFFFF', color: '#000' }}
            >
              White
            </button>
            <button
              type="button"
              className={`color-button ${customization.textColor === '#000000' ? 'active' : ''}`}
              onClick={() => handleTextColorChange('#000000')}
              style={{ backgroundColor: '#000000', color: '#FFF' }}
            >
              Black
            </button>
            <input
              type="color"
              value={customization.textColor}
              onChange={(e) => handleTextColorChange(e.target.value)}
              className="color-picker"
              title="Custom color"
            />
          </div>
        </div>

        <div className="customization-group">
          <label>Text Position</label>
          <div className="button-group">
            <button
              type="button"
              className={customization.textPosition === 'top' ? 'active' : ''}
              onClick={() => handlePositionChange('top')}
            >
              Top
            </button>
            <button
              type="button"
              className={customization.textPosition === 'center' ? 'active' : ''}
              onClick={() => handlePositionChange('center')}
            >
              Center
            </button>
            <button
              type="button"
              className={customization.textPosition === 'bottom' ? 'active' : ''}
              onClick={() => handlePositionChange('bottom')}
            >
              Bottom
            </button>
          </div>
        </div>

        <div className="customization-group">
          <label>
            Outline Width: {customization.outlineWidth || 5}px
          </label>
          <div className="outline-control">
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={customization.outlineWidth || 5}
              onChange={handleOutlineWidthChange}
              className="outline-slider"
            />
            <div className="slider-labels">
              <span>5px</span>
              <span>30px</span>
            </div>
          </div>
        </div>

        <div className="customization-group">
          <label>
            <input
              type="checkbox"
              checked={customization.backgroundOverlay}
              onChange={handleOverlayToggle}
            />
            Background Overlay
          </label>
          {customization.backgroundOverlay && (
            <div className="opacity-control">
              <label>
                Opacity: {Math.round(customization.overlayOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.1"
                value={customization.overlayOpacity}
                onChange={handleOpacityChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

