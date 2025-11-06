import { useState, useEffect, useCallback } from "react";
import PhotoUpload from "./components/PhotoUpload";
import TextInput from "./components/TextInput";
import TextCustomization from "./components/TextCustomization";
import CarouselPreview from "./components/CarouselPreview";
import ExportOptions from "./components/ExportOptions";
import { splitStory, getFirstSentence } from "./utils/textSplitter";
import { generateCarouselSlides } from "./utils/imageProcessor";
import type { TextCustomization as TextCustomizationType } from "./types";
import "./App.css";

const DEFAULT_CUSTOMIZATION: TextCustomizationType = {
  fontStyle: "modern",
  textColor: "#FFFFFF",
  textPosition: "center",
  backgroundOverlay: false,
  overlayOpacity: 0.5,
  outlineWidth: 5, // Default outline width (3-8 pixels)
  fontSize: 72, // Default font size (72-144 pixels)
};

function App() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [storyText, setStoryText] = useState("");
  const [slides, setSlides] = useState<string[]>([]);
  const [customization, setCustomization] = useState<TextCustomizationType>(
    DEFAULT_CUSTOMIZATION
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNumbers, setShowNumbers] = useState(false);

  // Generate carousel when dependencies change
  const generateCarousel = useCallback(async () => {
    if (!photo || !storyText.trim()) {
      setSlides([]);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Determine text for first slide and remaining story text
      let firstSlideText: string;
      let remainingStoryText: string;

      if (title.trim()) {
        // Title provided: use title on first slide, all story on remaining slides
        firstSlideText = title.trim();
        remainingStoryText = storyText;
      } else {
        // No title: extract first sentence for first slide, rest for remaining slides
        const firstSentence = getFirstSentence(storyText);
        firstSlideText = firstSentence;

        // Remove first sentence from story text for remaining slides
        if (firstSentence) {
          const trimmedStory = storyText.trim();
          const firstSentenceIndex = trimmedStory.indexOf(firstSentence);
          if (firstSentenceIndex !== -1) {
            remainingStoryText = trimmedStory
              .substring(firstSentenceIndex + firstSentence.length)
              .trim();
          } else {
            remainingStoryText = storyText;
          }
        } else {
          remainingStoryText = storyText;
        }
      }

      // Split remaining story into segments
      const textSegments = remainingStoryText.trim()
        ? splitStory(remainingStoryText, {
            maxCharsPerSlide: 125,
            minSlides: 8,
            maxSlides: 20,
          })
        : [];

      // Prepare slides: first slide with title/first sentence, rest with story segments
      const slideTexts: string[] = [];

      // Add title/first sentence as first slide
      if (firstSlideText) {
        slideTexts.push(firstSlideText);
      }

      // Add all story segments to remaining slides
      slideTexts.push(...textSegments);

      if (slideTexts.length === 0) {
        setSlides([]);
        return;
      }

      // Generate slides
      const generatedSlides = await generateCarouselSlides(
        photo,
        slideTexts,
        customization,
        showNumbers
      );

      setSlides(generatedSlides);
    } catch (err) {
      console.error("Error generating carousel:", err);
      setError("Failed to generate carousel. Please try again.");
      setSlides([]);
    } finally {
      setIsGenerating(false);
    }
  }, [photo, title, storyText, customization, showNumbers]);

  // Generate carousel when dependencies change (with debounce for text changes)
  useEffect(() => {
    const timer = setTimeout(() => {
      generateCarousel();
    }, 500); // Debounce text changes

    return () => clearTimeout(timer);
  }, [generateCarousel]);

  const handlePhotoChange = (newPhoto: File | null, preview: string | null) => {
    setPhoto(newPhoto);
    setPhotoPreview(preview);
  };

  const handleCustomizationChange = (
    newCustomization: TextCustomizationType
  ) => {
    setCustomization(newCustomization);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Carousel Generator</h1>
        <p>Create Instagram-style carousel posts with your story</p>
      </header>

      <main className="app-main">
        <div className="container">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={() => setError(null)} aria-label="Dismiss error">
                ✕
              </button>
            </div>
          )}

          <PhotoUpload
            photo={photo}
            photoPreview={photoPreview}
            onPhotoChange={handlePhotoChange}
          />

          <TextInput
            title={title}
            storyText={storyText}
            onTitleChange={setTitle}
            onTextChange={setStoryText}
          />

          <TextCustomization
            customization={customization}
            onCustomizationChange={handleCustomizationChange}
          />

          <CarouselPreview slides={slides} isLoading={isGenerating} />

          <ExportOptions
            slides={slides}
            isGenerating={isGenerating}
            showNumbers={showNumbers}
            onShowNumbersChange={setShowNumbers}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Carousel Generator MVP - Generate beautiful carousel posts for
          Instagram
        </p>
      </footer>
    </div>
  );
}

export default App;
