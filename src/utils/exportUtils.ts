import JSZip from 'jszip';
import { detectPlatform, canShareFiles } from './platformDetection';

/**
 * Generate filename in format: 001_First_Three_Words.jpg
 * @param index Zero-based index of the slide (will be converted to 1-based for numbering)
 * @param title Title string to extract words from
 * @returns Formatted filename
 */
export function generateFilename(index: number, title: string): string {
  // Zero-pad index to 3 digits (001, 002, etc.)
  const slideNumber = String(index + 1).padStart(3, '0');
  
  // Extract first 3 words from title (or all words if fewer than 3)
  const words = title.trim().split(/\s+/).filter(word => word.length > 0);
  const firstThreeWords = words.slice(0, 3);
  
  // Convert to Title Case and replace spaces with underscores
  const titlePart = firstThreeWords
    .map(word => {
      // Remove special characters that could break filenames, keep only alphanumeric
      const cleanedWord = word.replace(/[^a-zA-Z0-9]/g, '');
      // Convert to Title Case: first letter uppercase, rest lowercase
      if (cleanedWord.length > 0) {
        return cleanedWord.charAt(0).toUpperCase() + cleanedWord.slice(1).toLowerCase();
      }
      return '';
    })
    .filter(word => word.length > 0)
    .join('_');
  
  // If no words available, use a default
  const finalTitlePart = titlePart || 'Carousel';
  
  return `${slideNumber}_${finalTitlePart}.jpg`;
}

/**
 * Convert data URL to Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Share a single image using Web Share API (Android)
 */
export async function shareImage(dataURL: string, filename: string): Promise<boolean> {
  if (!canShareFiles()) {
    return false;
  }

  try {
    const blob = dataURLtoBlob(dataURL);
    const file = new File([blob], filename, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: filename,
        text: 'Carousel image',
      });
      return true;
    }
  } catch (error) {
    // User cancelled or error occurred
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing image:', error);
    }
  }

  return false;
}

/**
 * Share all images one by one (Android)
 */
export async function shareAllImages(slides: string[], title: string): Promise<void> {
  if (!canShareFiles()) {
    throw new Error('Web Share API not supported');
  }

  for (let index = 0; index < slides.length; index++) {
    const filename = generateFilename(index, title);
    
    try {
      await shareImage(slides[index], filename);
      // Small delay between shares
      if (index < slides.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error sharing image ${index + 1}:`, error);
      // Continue with next image even if one fails
    }
  }
}

/**
 * Open image in new tab for iOS save flow
 */
export function openImageInNewTab(dataURL: string): void {
  const blob = dataURLtoBlob(dataURL);
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');
  
  // Clean up URL after a delay
  setTimeout(() => {
    if (newWindow) {
      URL.revokeObjectURL(url);
    }
  }, 1000);
}

/**
 * Download a single image
 */
export function downloadImage(dataURL: string, filename: string): void {
  const blob = dataURLtoBlob(dataURL);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download all images individually
 */
export function downloadAllImages(slides: string[], title: string): void {
  const platform = detectPlatform();
  
  // On iOS, download all first, then user can save manually
  if (platform === 'ios') {
    slides.forEach((slide, index) => {
      const filename = generateFilename(index, title);
      
      // Small delay to avoid browser blocking multiple downloads
      setTimeout(() => {
        downloadImage(slide, filename);
      }, index * 100);
    });
  } else {
    // Desktop and Android: standard download
    slides.forEach((slide, index) => {
      const filename = generateFilename(index, title);
      
      // Small delay to avoid browser blocking multiple downloads
      setTimeout(() => {
        downloadImage(slide, filename);
      }, index * 100);
    });
  }
}

/**
 * Generate and download ZIP file with all images
 */
export async function downloadAsZip(slides: string[], title: string): Promise<void> {
  const zip = new JSZip();

  slides.forEach((slide, index) => {
    const filename = generateFilename(index, title);
    const blob = dataURLtoBlob(slide);
    zip.file(filename, blob);
  });

  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'carousel.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP file:', error);
    throw error;
  }
}

