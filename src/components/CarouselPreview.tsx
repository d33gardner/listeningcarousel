import { useState } from 'react';
import './CarouselPreview.css';

interface CarouselPreviewProps {
  slides: string[];
  isLoading?: boolean;
}

export default function CarouselPreview({ slides, isLoading }: CarouselPreviewProps) {
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);

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
          return (
            <div
              key={index}
              className="preview-card"
              onClick={() => setSelectedSlide(index)}
            >
              <div className="slide-number">{slideNumber}</div>
              <img src={slide} alt={`Slide ${slideNumber}`} />
            </div>
          );
        })}
      </div>

      {selectedSlide !== null && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSlide(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
          </div>
        </div>
      )}
    </div>
  );
}

