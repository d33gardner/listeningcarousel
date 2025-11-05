import JSZip from 'jszip';

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
export function downloadAllImages(slides: string[]): void {
  slides.forEach((slide, index) => {
    const slideNumber = String(index + 1).padStart(2, '0');
    const filename = `carousel_${slideNumber}.jpg`;
    
    // Small delay to avoid browser blocking multiple downloads
    setTimeout(() => {
      downloadImage(slide, filename);
    }, index * 100);
  });
}

/**
 * Generate and download ZIP file with all images
 */
export async function downloadAsZip(slides: string[]): Promise<void> {
  const zip = new JSZip();

  slides.forEach((slide, index) => {
    const slideNumber = String(index + 1).padStart(2, '0');
    const filename = `carousel_${slideNumber}.jpg`;
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

