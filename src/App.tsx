import { useState, useEffect, useCallback, useRef } from "react";
import PhotoUpload from "./components/PhotoUpload";
import TextInput from "./components/TextInput";
import TextCustomization from "./components/TextCustomization";
import CarouselPreview from "./components/CarouselPreview";
import ExportOptions from "./components/ExportOptions";
import { splitStory, getFirstSentence } from "./utils/textSplitter";
import { createCarouselSlide } from "./utils/imageProcessor";
import type { TextCustomization as TextCustomizationType } from "./types";
import {
  localStorageUtils,
  indexedDBUtils,
  storageUtils,
} from "./utils/storage";
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
  const [persistEnabled, setPersistEnabled] = useState(() =>
    localStorageUtils.getPersistEnabled()
  );
  const [isLoadingPersistedData, setIsLoadingPersistedData] = useState(true);

  // Store custom photos per slide index
  const [customSlidePhotos, setCustomSlidePhotos] = useState<Map<number, File>>(
    new Map()
  );
  const [customSlidePreviews, setCustomSlidePreviews] = useState<
    Map<number, string>
  >(new Map());
  const customSlidePhotosRef = useRef<Map<number, File>>(new Map());

  // Store slide texts for regeneration
  const slideTextsRef = useRef<string[]>([]);
  const showNumbersRef = useRef<boolean>(false);

  // Track which slides are currently regenerating
  const [regeneratingSlides, setRegeneratingSlides] = useState<Set<number>>(
    new Set()
  );

  // Keep refs in sync with state
  useEffect(() => {
    showNumbersRef.current = showNumbers;
  }, [showNumbers]);

  useEffect(() => {
    customSlidePhotosRef.current = customSlidePhotos;
  }, [customSlidePhotos]);

  // Load persisted data on mount (only once)
  useEffect(() => {
    const loadPersistedData = async () => {
      const currentPersistEnabled = localStorageUtils.getPersistEnabled();
      if (!currentPersistEnabled) {
        setIsLoadingPersistedData(false);
        return;
      }

      try {
        // Load text and settings from localStorage
        const savedTitle = localStorageUtils.getTitle();
        const savedStoryText = localStorageUtils.getStoryText();
        const savedCustomization = localStorageUtils.getCustomization();
        const savedShowNumbers = localStorageUtils.getShowNumbers();
        const savedPhotoPreview = localStorageUtils.getPhotoPreview();
        const savedCustomSlidePreviews =
          localStorageUtils.getCustomSlidePreviews();

        if (savedTitle) setTitle(savedTitle);
        if (savedStoryText) setStoryText(savedStoryText);
        if (savedCustomization) setCustomization(savedCustomization);
        if (savedShowNumbers) setShowNumbers(savedShowNumbers);
        if (savedPhotoPreview) setPhotoPreview(savedPhotoPreview);

        // Load images from IndexedDB
        const savedMainPhoto = await indexedDBUtils.getMainPhoto();
        if (savedMainPhoto) {
          setPhoto(savedMainPhoto);
          if (!savedPhotoPreview) {
            // Generate preview if not already saved
            const reader = new FileReader();
            reader.onload = (e) => {
              setPhotoPreview(e.target?.result as string);
            };
            reader.readAsDataURL(savedMainPhoto);
          }
        }

        // Load custom slide photos
        const savedCustomSlidePhotos =
          await indexedDBUtils.getAllCustomSlidePhotos();
        if (savedCustomSlidePhotos.size > 0) {
          setCustomSlidePhotos(savedCustomSlidePhotos);
          // Set previews if available
          if (savedCustomSlidePreviews.size > 0) {
            setCustomSlidePreviews(savedCustomSlidePreviews);
          } else {
            // Generate previews if not saved
            const newPreviews = new Map<number, string>();
            for (const [index, file] of savedCustomSlidePhotos) {
              const reader = new FileReader();
              reader.onload = (e) => {
                newPreviews.set(index, e.target?.result as string);
                if (newPreviews.size === savedCustomSlidePhotos.size) {
                  setCustomSlidePreviews(new Map(newPreviews));
                }
              };
              reader.readAsDataURL(file);
            }
          }
        }

        // Load generated slides
        const savedSlides = await indexedDBUtils.getGeneratedSlides();
        if (savedSlides && savedSlides.length > 0) {
          setSlides(savedSlides);
        }

        // Load slide texts for regeneration
        const savedSlideTexts = localStorageUtils.getSlideTexts();
        if (savedSlideTexts.length > 0) {
          slideTextsRef.current = savedSlideTexts;
        }
      } catch (err) {
        console.error("Failed to load persisted data:", err);
        setError("Failed to load saved data. Starting fresh.");
      } finally {
        setIsLoadingPersistedData(false);
      }
    };

    loadPersistedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Handle persist enabled toggle
  useEffect(() => {
    localStorageUtils.setPersistEnabled(persistEnabled);

    if (!persistEnabled) {
      // Clear all stored data when disabled
      storageUtils.clearAll().catch((err) => {
        console.error("Failed to clear stored data:", err);
      });
    }
  }, [persistEnabled]);

  // Save title when it changes (debounced)
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;

    const timer = setTimeout(() => {
      localStorageUtils.setTitle(title);
    }, 500);

    return () => clearTimeout(timer);
  }, [title, persistEnabled, isLoadingPersistedData]);

  // Save story text when it changes (debounced)
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;

    const timer = setTimeout(() => {
      localStorageUtils.setStoryText(storyText);
    }, 500);

    return () => clearTimeout(timer);
  }, [storyText, persistEnabled, isLoadingPersistedData]);

  // Save customization when it changes
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;
    localStorageUtils.setCustomization(customization);
  }, [customization, persistEnabled, isLoadingPersistedData]);

  // Save showNumbers when it changes
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;
    localStorageUtils.setShowNumbers(showNumbers);
  }, [showNumbers, persistEnabled, isLoadingPersistedData]);

  // Save photo when it changes
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;

    if (photo) {
      indexedDBUtils.saveMainPhoto(photo).catch((err) => {
        console.error("Failed to save photo:", err);
      });
    } else {
      // Delete main photo from storage when removed
      indexedDBUtils.deleteMainPhoto().catch((err) => {
        console.error("Failed to delete photo from storage:", err);
      });
    }
  }, [photo, persistEnabled, isLoadingPersistedData]);

  // Save photo preview when it changes
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData) return;
    localStorageUtils.setPhotoPreview(photoPreview);
  }, [photoPreview, persistEnabled, isLoadingPersistedData]);

  // Save custom slide photos when they change
  useEffect(() => {
    if (
      !persistEnabled ||
      isLoadingPersistedData ||
      customSlidePhotos.size === 0
    )
      return;

    const saveCustomPhotos = async () => {
      for (const [index, file] of customSlidePhotos) {
        try {
          await indexedDBUtils.saveCustomSlidePhoto(index, file);
        } catch (err) {
          console.error(`Failed to save custom slide photo ${index}:`, err);
        }
      }
    };

    saveCustomPhotos();
  }, [customSlidePhotos, persistEnabled, isLoadingPersistedData]);

  // Save custom slide previews when they change
  useEffect(() => {
    if (
      !persistEnabled ||
      isLoadingPersistedData ||
      customSlidePreviews.size === 0
    )
      return;
    localStorageUtils.setCustomSlidePreviews(customSlidePreviews);
  }, [customSlidePreviews, persistEnabled, isLoadingPersistedData]);

  // Save generated slides when they change
  useEffect(() => {
    if (!persistEnabled || isLoadingPersistedData || slides.length === 0)
      return;

    indexedDBUtils.saveGeneratedSlides(slides).catch((err) => {
      console.error("Failed to save generated slides:", err);
    });
  }, [slides, persistEnabled, isLoadingPersistedData]);

  // Generate carousel when dependencies change
  const generateCarousel = useCallback(async () => {
    if (!photo || !storyText.trim()) {
      setSlides([]);
      slideTextsRef.current = [];
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
        slideTextsRef.current = [];
        return;
      }

      // Store slide texts for regeneration
      slideTextsRef.current = slideTexts;

      // Save slide texts to localStorage if persistence is enabled
      if (persistEnabled && !isLoadingPersistedData) {
        localStorageUtils.setSlideTexts(slideTexts);
      }

      // Preserve custom photos for existing slide indices
      // Remove photos for slides that no longer exist
      setCustomSlidePhotos((prev: Map<number, File>) => {
        const newMap = new Map<number, File>();
        prev.forEach((file: File, index: number) => {
          if (index < slideTexts.length) {
            newMap.set(index, file);
          }
        });
        return newMap;
      });

      setCustomSlidePreviews((prev: Map<number, string>) => {
        const newMap = new Map<number, string>();
        prev.forEach((preview: string, index: number) => {
          if (index < slideTexts.length) {
            newMap.set(index, preview);
          }
        });
        return newMap;
      });

      // Generate slides using custom photos when available, fallback to default photo
      const generatedSlides: string[] = [];
      for (let i = 0; i < slideTexts.length; i++) {
        const slidePhoto = customSlidePhotosRef.current.get(i) || photo;
        const slide = await createCarouselSlide(
          slidePhoto,
          slideTexts[i],
          customization,
          i + 1,
          showNumbers
        );
        generatedSlides.push(slide);
      }

      setSlides(generatedSlides);
    } catch (err) {
      console.error("Error generating carousel:", err);
      setError("Failed to generate carousel. Please try again.");
      setSlides([]);
      slideTextsRef.current = [];
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
    // Clear custom slide photos when default photo changes
    if (!newPhoto) {
      setCustomSlidePhotos(new Map());
      setCustomSlidePreviews(new Map());
    }
  };

  const handleCustomizationChange = (
    newCustomization: TextCustomizationType
  ) => {
    setCustomization(newCustomization);
  };

  // Regenerate a single slide
  const regenerateSingleSlide = useCallback(
    async (index: number, overridePhoto?: File | null) => {
      if (
        !photo ||
        slideTextsRef.current.length === 0 ||
        index >= slideTextsRef.current.length
      ) {
        return;
      }

      setRegeneratingSlides((prev: Set<number>) => new Set(prev).add(index));
      setError(null);

      try {
        // Use overridePhoto if provided, otherwise check ref, otherwise use default photo
        const slidePhoto =
          overridePhoto !== undefined
            ? overridePhoto || photo
            : customSlidePhotosRef.current.get(index) || photo;
        const slideText = slideTextsRef.current[index];

        // Use ref to ensure we always have the latest showNumbers value
        const currentShowNumbers = showNumbersRef.current;
        const newSlide = await createCarouselSlide(
          slidePhoto,
          slideText,
          customization,
          index + 1,
          currentShowNumbers
        );

        setSlides((prev: string[]) => {
          const updated = [...prev];
          updated[index] = newSlide;
          return updated;
        });
      } catch (err) {
        console.error("Error regenerating slide:", err);
        setError(`Failed to regenerate slide ${index + 1}. Please try again.`);
      } finally {
        setRegeneratingSlides((prev: Set<number>) => {
          const updated = new Set(prev);
          updated.delete(index);
          return updated;
        });
      }
    },
    [photo, customization, showNumbers]
  );

  // Regenerate all slides
  const regenerateAllSlides = useCallback(async () => {
    if (!photo || slideTextsRef.current.length === 0) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generatedSlides: string[] = [];
      const currentShowNumbers = showNumbersRef.current;
      for (let i = 0; i < slideTextsRef.current.length; i++) {
        const slidePhoto = customSlidePhotosRef.current.get(i) || photo;
        const slide = await createCarouselSlide(
          slidePhoto,
          slideTextsRef.current[i],
          customization,
          i + 1,
          currentShowNumbers
        );
        generatedSlides.push(slide);
      }

      setSlides(generatedSlides);
    } catch (err) {
      console.error("Error regenerating all slides:", err);
      setError("Failed to regenerate carousel. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [photo, customization, showNumbers]);

  // Handle photo change for a specific slide
  const handleSlidePhotoChange = useCallback(
    (index: number, file: File | null, preview: string | null) => {
      if (file && preview) {
        // Update ref immediately so regenerateSingleSlide can use it
        customSlidePhotosRef.current.set(index, file);

        setCustomSlidePhotos((prev: Map<number, File>) => {
          const newMap = new Map(prev);
          newMap.set(index, file);
          return newMap;
        });
        setCustomSlidePreviews((prev: Map<number, string>) => {
          const newMap = new Map(prev);
          newMap.set(index, preview);
          return newMap;
        });
        // Regenerate the slide with new photo - pass it directly to avoid race condition
        regenerateSingleSlide(index, file);
      }
    },
    [regenerateSingleSlide]
  );

  // Reset a slide to use default photo
  const handleResetSlidePhoto = useCallback(
    (index: number) => {
      // Update ref immediately
      customSlidePhotosRef.current.delete(index);

      setCustomSlidePhotos((prev: Map<number, File>) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
      setCustomSlidePreviews((prev: Map<number, string>) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });

      // Delete from storage if persistence is enabled
      if (persistEnabled && !isLoadingPersistedData) {
        indexedDBUtils.deleteCustomSlidePhoto(index).catch((err) => {
          console.error(
            `Failed to delete custom slide photo ${index} from storage:`,
            err
          );
        });
      }

      // Regenerate the slide with default photo - pass null to use default
      regenerateSingleSlide(index, null);
    },
    [regenerateSingleSlide, persistEnabled, isLoadingPersistedData]
  );

  // Apply one slide's photo to all slides
  const handleApplyPhotoToAll = useCallback(
    (sourceIndex: number) => {
      const sourcePhoto = customSlidePhotosRef.current.get(sourceIndex);
      const sourcePreview = customSlidePreviews.get(sourceIndex);

      if (!sourcePhoto || !sourcePreview) {
        return;
      }

      // Apply to all slides
      setCustomSlidePhotos((prev: Map<number, File>) => {
        const newMap = new Map(prev);
        for (let i = 0; i < slideTextsRef.current.length; i++) {
          newMap.set(i, sourcePhoto);
        }
        return newMap;
      });

      setCustomSlidePreviews((prev: Map<number, string>) => {
        const newMap = new Map(prev);
        for (let i = 0; i < slideTextsRef.current.length; i++) {
          newMap.set(i, sourcePreview);
        }
        return newMap;
      });

      // Regenerate all slides
      regenerateAllSlides();
    },
    [customSlidePreviews, regenerateAllSlides]
  );

  // Regenerate all slides with custom photos when showNumbers changes
  useEffect(() => {
    // Only regenerate if we have slides with custom photos
    if (
      slides.length > 0 &&
      customSlidePhotos.size > 0 &&
      slideTextsRef.current.length > 0
    ) {
      // Regenerate all slides that have custom photos
      const regenerateCustomSlides = async () => {
        const indicesToRegenerate = Array.from(
          customSlidePhotos.keys()
        ) as number[];
        for (const index of indicesToRegenerate) {
          if (index < slideTextsRef.current.length) {
            // Use the ref to get the current photo, and let regenerateSingleSlide use showNumbersRef
            await regenerateSingleSlide(index);
          }
        }
      };
      regenerateCustomSlides();
    }
    // Only depend on showNumbers - regenerateSingleSlide is stable enough via its dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNumbers]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Carousel Generator</h1>
        <p>Create Instagram-style carousel posts with your story</p>
        <div className="persist-toggle">
          <label>
            <input
              type="checkbox"
              checked={persistEnabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPersistEnabled(e.target.checked)
              }
            />
            <span>Save data across refreshes</span>
          </label>
        </div>
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
            showNumbers={showNumbers}
            onShowNumbersChange={setShowNumbers}
            isGenerating={isGenerating}
          />

          <CarouselPreview
            slides={slides}
            isLoading={isGenerating}
            regeneratingSlides={regeneratingSlides}
            customSlidePhotos={customSlidePreviews}
            onSlidePhotoChange={handleSlidePhotoChange}
            onResetSlidePhoto={handleResetSlidePhoto}
            onApplyPhotoToAll={handleApplyPhotoToAll}
            onRegenerateAll={regenerateAllSlides}
          />

          <ExportOptions
            slides={slides}
            isGenerating={isGenerating}
            showNumbers={showNumbers}
            onShowNumbersChange={setShowNumbers}
            title={title}
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
