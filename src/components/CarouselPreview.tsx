import { useState, useEffect, useRef } from 'react';
import './CarouselPreview.css';

interface CarouselPreviewProps {
  slides: string[];
  isLoading?: boolean;
  regeneratingSlides?: Set<number>;
  customSlidePhotos?: Map<number, string>;
  onSlidePhotoChange?: (index: number, file: File | null, preview: string | null) => void;
  onResetSlidePhoto?: (index: number) => void;
  onApplyPhotoToAll?: (sourceIndex: number) => void;
  onRegenerateAll?: () => void;
}

export default function CarouselPreview({
  slides,
  isLoading,
  regeneratingSlides = new Set(),
  customSlidePhotos = new Map(),
  onSlidePhotoChange,
  onResetSlidePhoto,
  onApplyPhotoToAll,
  onRegenerateAll,
}: CarouselPreviewProps) {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedSlide !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedSlide]);

  // Handle swipe gestures
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || selectedSlide === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && selectedSlide < slides.length - 1) {
      setSelectedSlide(selectedSlide + 1);
    }
    if (isRightSwipe && selectedSlide > 0) {
      setSelectedSlide(selectedSlide - 1);
    }
  };

  const handleFileChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onSlidePhotoChange) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      onSlidePhotoChange(index, file, preview);
    };
    reader.onerror = () => {
      alert('Error reading image file');
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleChangePhotoClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const input = fileInputRefs.current.get(index);
    if (input) {
      input.click();
    }
  };

  const handleResetClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResetSlidePhoto) {
      onResetSlidePhoto(index);
    }
  };

  const handleApplyToAllClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApplyPhotoToAll) {
      onApplyPhotoToAll(index);
    }
  };

  if (isLoading) {
    return (
      <div className="carousel-preview">
        <h2>Step 4: Preview</h2>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generating your carousel...</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="carousel-preview">
        <h2>Step 4: Preview</h2>
        <div className="empty-state">
          <p>Complete the steps above to generate your carousel preview.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-preview">
      <h2>Step 4: Preview ({slides.length} slides)</h2>
      
      <div className="preview-grid">
        {slides.map((slide, index) => {
          const slideNumber = String(index + 1).padStart(2, '0');
          const hasCustomPhoto = customSlidePhotos.has(index);
          const isRegenerating = regeneratingSlides.has(index);
          
          return (
            <div key={index} className="preview-card-wrapper">
              <div
                className="preview-card"
                onClick={() => setSelectedSlide(index)}
              >
                <div className="slide-number">{slideNumber}</div>
                {hasCustomPhoto && (
                  <div className="custom-photo-indicator" title="Custom photo">
                    📷
                  </div>
                )}
                {isRegenerating && (
                  <div className="slide-loading-overlay">
                    <div className="slide-loading-spinner"></div>
                  </div>
                )}
                <img src={slide} alt={`Slide ${slideNumber}`} />
              </div>
              <div className="preview-card-actions" onClick={(e) => e.stopPropagation()}>
                <input
                  ref={(el) => {
                    if (el) {
                      fileInputRefs.current.set(index, el);
                    } else {
                      fileInputRefs.current.delete(index);
                    }
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e)}
                  className="file-input-hidden"
                  id={`slide-photo-input-${index}`}
                />
                <button
                  type="button"
                  className="preview-action-btn change-photo-btn"
                  onClick={(e) => handleChangePhotoClick(index, e)}
                  disabled={isRegenerating}
                  aria-label="Change photo"
                >
                  Change Photo
                </button>
                {hasCustomPhoto && (
                  <>
                    <button
                      type="button"
                      className="preview-action-btn reset-photo-btn"
                      onClick={(e) => handleResetClick(index, e)}
                      disabled={isRegenerating}
                      aria-label="Reset to default photo"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      className="preview-action-btn apply-all-btn"
                      onClick={(e) => handleApplyToAllClick(index, e)}
                      disabled={isRegenerating}
                      aria-label="Apply this photo to all slides"
                    >
                      Apply to All
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 0 && onRegenerateAll && (
        <div className="regenerate-all-container">
          <button
            type="button"
            className="regenerate-all-btn"
            onClick={onRegenerateAll}
            disabled={isLoading || regeneratingSlides.size > 0}
          >
            Regenerate All Slides
          </button>
        </div>
      )}

      {selectedSlide !== null && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSlide(null)}
          ref={modalRef}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedSlide(null)}
              aria-label="Close preview"
            >
              ✕
            </button>
            <div className="modal-slide-number">
              {String(selectedSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </div>
            <img
              src={slides[selectedSlide]}
              alt={`Slide ${String(selectedSlide + 1).padStart(2, '0')}`}
              className="modal-image"
            />
            {selectedSlide > 0 && (
              <button
                className="modal-nav modal-nav-prev"
                onClick={() => setSelectedSlide(selectedSlide - 1)}
                aria-label="Previous slide"
              >
                ‹
              </button>
            )}
            {selectedSlide < slides.length - 1 && (
              <button
                className="modal-nav modal-nav-next"
                onClick={() => setSelectedSlide(selectedSlide + 1)}
                aria-label="Next slide"
              >
                ›
              </button>
            )}
            <div className="modal-indicators">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`modal-indicator ${index === selectedSlide ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

