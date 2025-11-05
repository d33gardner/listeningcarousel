/**
 * Smart story splitting algorithm
 * Splits text into slides (8-20 slides)
 * Priority: sentences > punctuation > character count
 */

export interface SplitOptions {
  maxCharsPerSlide?: number;
  minSlides?: number;
  maxSlides?: number;
}

const DEFAULT_OPTIONS: Required<SplitOptions> = {
  maxCharsPerSlide: 125,
  minSlides: 8,
  maxSlides: 20,
};

/**
 * Split text on sentence boundaries (periods, exclamation, question marks)
 */
function splitIntoSentences(text: string): string[] {
  // Split on sentence endings, but keep the punctuation
  const sentenceRegex = /([.!?]+)\s+/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = text.substring(lastIndex, match.index + match[1].length).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  const remaining = text.substring(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences.filter(s => s.length > 0);
}

/**
 * Split long sentence on punctuation marks
 */
function splitLongSentence(sentence: string, maxChars: number): string[] {
  if (sentence.length <= maxChars) {
    return [sentence];
  }

  const segments: string[] = [];
  // Split on commas, semicolons, and dashes
  const punctuationRegex = /([,;—–-])\s*/g;
  let lastIndex = 0;
  let currentSegment = '';

  let match;
  while ((match = punctuationRegex.exec(sentence)) !== null) {
    const segment = sentence.substring(lastIndex, match.index + match[1].length).trim();
    
    if ((currentSegment + ' ' + segment).length <= maxChars) {
      currentSegment = currentSegment ? currentSegment + ' ' + segment : segment;
    } else {
      if (currentSegment) {
        segments.push(currentSegment);
      }
      currentSegment = segment;
    }
    lastIndex = match.index + match[0].length;
  }

  // Handle remaining text
  const remaining = sentence.substring(lastIndex).trim();
  if (currentSegment) {
    if ((currentSegment + ' ' + remaining).length <= maxChars) {
      segments.push(currentSegment + ' ' + remaining);
    } else {
      segments.push(currentSegment);
      if (remaining) {
        segments.push(remaining);
      }
    }
  } else if (remaining) {
    segments.push(remaining);
  }

  return segments.length > 0 ? segments : [sentence];
}

/**
 * Split text into chunks that fit within character limit
 */
function splitByCharacterCount(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const word of words) {
    const testChunk = currentChunk ? `${currentChunk} ${word}` : word;
    
    if (testChunk.length <= maxChars) {
      currentChunk = testChunk;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

/**
 * Adjust slide count to meet min/max requirements
 */
function adjustSlideCount(
  slides: string[],
  minSlides: number,
  maxSlides: number
): string[] {
  if (slides.length === 0) {
    return ['Enter your story to begin...'];
  }

  // If too many slides, merge some
  if (slides.length > maxSlides) {
    const merged: string[] = [];
    const slidesPerMerged = Math.ceil(slides.length / maxSlides);

    for (let i = 0; i < slides.length; i += slidesPerMerged) {
      const batch = slides.slice(i, i + slidesPerMerged);
      merged.push(batch.join(' '));
    }

    return merged.slice(0, maxSlides);
  }

  // If too few slides, split larger ones
  if (slides.length < minSlides) {
    const expanded: string[] = [];
    const targetSlidesPerOriginal = Math.ceil(minSlides / slides.length);

    for (const slide of slides) {
      if (slide.length > 100 && expanded.length + targetSlidesPerOriginal <= minSlides) {
        // Split this slide
        const split = splitByCharacterCount(slide, Math.ceil(slide.length / targetSlidesPerOriginal));
        expanded.push(...split);
      } else {
        expanded.push(slide);
      }
    }

    // If still not enough, split the largest remaining slides
    while (expanded.length < minSlides && expanded.length > 0) {
      const largestIndex = expanded.reduce((maxIdx, slide, idx) => 
        slide.length > expanded[maxIdx].length ? idx : maxIdx, 0
      );
      
      const largest = expanded[largestIndex];
      if (largest.length > 50) {
        const split = splitByCharacterCount(largest, Math.ceil(largest.length / 2));
        expanded.splice(largestIndex, 1, ...split);
      } else {
        break;
      }
    }

    return expanded.slice(0, maxSlides);
  }

  return slides;
}

/**
 * Main function to split story text into slides
 */
export function splitStory(text: string, options: SplitOptions = {}): string[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  if (!text || text.trim().length === 0) {
    return [];
  }

  const trimmedText = text.trim();
  
  // Step 1: Split into sentences
  let slides = splitIntoSentences(trimmedText);

  // Step 2: Split long sentences on punctuation
  const processedSlides: string[] = [];
  for (const sentence of slides) {
    if (sentence.length > opts.maxCharsPerSlide) {
      const split = splitLongSentence(sentence, opts.maxCharsPerSlide);
      processedSlides.push(...split);
    } else {
      processedSlides.push(sentence);
    }
  }

  // Step 3: Split any remaining long segments
  const finalSlides: string[] = [];
  for (const slide of processedSlides) {
    if (slide.length > opts.maxCharsPerSlide) {
      const split = splitByCharacterCount(slide, opts.maxCharsPerSlide);
      finalSlides.push(...split);
    } else {
      finalSlides.push(slide);
    }
  }

  // Step 4: Adjust to meet min/max requirements
  return adjustSlideCount(finalSlides, opts.minSlides, opts.maxSlides);
}

