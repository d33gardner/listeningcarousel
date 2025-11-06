import { useState, useRef, useEffect } from 'react';
import { detectPlatform } from '../utils/platformDetection';
import './PhotoUpload.css';

interface PhotoUploadProps {
  photo: File | null;
  photoPreview: string | null;
  onPhotoChange: (photo: File | null, preview: string | null) => void;
}

export default function PhotoUpload({
  photo: _photo,
  photoPreview,
  onPhotoChange,
}: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      onPhotoChange(null, null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onPhotoChange(file, preview);
    };
    reader.onerror = () => {
      setError('Error reading image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  return (
    <div className="photo-upload">
      <h2>Step 1: Upload Photo</h2>
      
      {!photoPreview ? (
        <div className="upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
            id="photo-upload-input"
          />
          <label htmlFor="photo-upload-input" className="upload-label">
            <div className="upload-icon">📷</div>
            <div className="upload-text">
              <strong>Click to upload</strong> or drag and drop
            </div>
            <div className="upload-hint">PNG, JPG, JPEG up to 10MB</div>
          </label>
          {platform === 'ios' && !photoPreview && (
            <div className="upload-instructions">
              <p className="instructions-text">
                💡 <strong>Tip:</strong> Select "Photo Library" to access your iCloud Photos
              </p>
            </div>
          )}
          {platform === 'android' && !photoPreview && (
            <div className="upload-instructions">
              <p className="instructions-text">
                💡 <strong>Tip:</strong> Select "Gallery" or browse to Google Photos to access your photos
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="photo-preview-container">
          <div className="photo-preview">
            <img src={photoPreview} alt="Preview" />
            <button
              type="button"
              onClick={handleRemove}
              className="remove-button"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="change-button"
          >
            Change Photo
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

