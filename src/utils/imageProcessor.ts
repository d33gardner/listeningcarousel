import type { TextCustomization } from '../types';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

/**
 * Load image from File or URL
 */
function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => resolve(img);
    img.onerror = reject;

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}

/**
 * Draw background overlay on canvas
 */
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  opacity: number
): void {
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

/**
 * Calculate text position based on position setting and text height
 * Returns the Y position for the center of the text block
 */
function getTextPosition(
  position: 'top' | 'center' | 'bottom',
  textHeight: number,
  outlineWidth: number
): number {
  const padding = 80;
  const outlinePadding = outlineWidth / 2; // Account for outline extending beyond text
  
  switch (position) {
    case 'top':
      // Position from top with enough space for text height and outline
      return padding + (textHeight / 2) + outlinePadding + 20;
    case 'bottom':
      // Position from bottom with enough space for text height and outline
      return CANVAS_HEIGHT - padding - (textHeight / 2) - outlinePadding - 20;
    case 'center':
    default:
      return CANVAS_HEIGHT / 2;
  }
}

/**
 * Get font style based on customization
 */
function getFontStyle(fontStyle: 'modern' | 'classic' | 'bold'): string {
  switch (fontStyle) {
    case 'modern':
      return 'Helvetica, Arial, sans-serif';
    case 'classic':
      return 'Georgia, serif';
    case 'bold':
      return 'Impact, "Arial Black", sans-serif';
    default:
      return 'Helvetica, Arial, sans-serif';
  }
}

/**
 * Wrap text to fit within canvas width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

/**
 * Determine if a color is white or close to white
 */
function isWhiteColor(color: string): boolean {
  // Normalize color string
  const normalizedColor = color.trim().toLowerCase();
  
  // Handle hex colors
  if (normalizedColor.startsWith('#')) {
    let hex = normalizedColor.replace('#', '');
    
    // Handle 3-digit hex (#fff -> #ffffff)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    
    // Handle 6-digit hex
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // If average RGB is > 200, consider it white
      return (r + g + b) / 3 > 200;
    }
  }
  
  // Handle rgb/rgba colors
  if (normalizedColor.includes('rgb')) {
    const matches = normalizedColor.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]);
      const g = parseInt(matches[1]);
      const b = parseInt(matches[2]);
      return (r + g + b) / 3 > 200;
    }
  }
  
  // Default check for common white values
  return normalizedColor === '#ffffff' || 
         normalizedColor === '#fff' || 
         normalizedColor === 'white' ||
         normalizedColor === 'rgb(255, 255, 255)';
}

/**
 * Get inverse outline color based on text color
 */
function getInverseOutlineColor(textColor: string): string {
  if (isWhiteColor(textColor)) {
    return '#000000'; // Black outline for white text
  } else {
    return '#FFFFFF'; // White outline for dark text
  }
}

/**
 * Draw text on canvas with styling
 */
function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  customization: TextCustomization,
  yPosition: number
): void {
  const maxWidth = CANVAS_WIDTH - 160; // 80px padding on each side
  const fontSize = customization.fontSize || 72; // Default to 72 if not set
  const lineHeight = fontSize * 1.4;
  const outlineWidth = customization.outlineWidth || 5; // Default to 5 if not set

  ctx.font = `${fontSize}px ${getFontStyle(customization.fontStyle)}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Wrap text
  const lines = wrapText(ctx, text, maxWidth);

  // Calculate total height
  const totalHeight = lines.length * lineHeight;
  
  // Calculate start Y position - center the text block at yPosition
  let startY = yPosition - totalHeight / 2;
  
  // Ensure text doesn't go above canvas bounds
  const minY = (fontSize / 2) + (outlineWidth / 2) + 10;
  if (startY < minY) {
    startY = minY;
  }
  
  // Ensure text doesn't go below canvas bounds
  const maxY = CANVAS_HEIGHT - (fontSize / 2) - (outlineWidth / 2) - 10;
  const lastLineY = startY + (lines.length - 1) * lineHeight;
  if (lastLineY > maxY) {
    startY = maxY - ((lines.length - 1) * lineHeight);
  }

  // Get inverse outline color
  const outlineColor = getInverseOutlineColor(customization.textColor);

  // Draw text with outline
  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    const x = CANVAS_WIDTH / 2;

    // Draw outline (stroke) first - draw multiple times for better visibility at larger widths
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.miterLimit = 2;
    
    // For thicker outlines, draw multiple strokes for better coverage
    const strokeCount = outlineWidth > 10 ? Math.ceil(outlineWidth / 8) : 1;
    for (let i = 0; i < strokeCount; i++) {
      ctx.strokeText(line, x, y);
    }

    // Draw filled text on top
    ctx.fillStyle = customization.textColor;
    ctx.fillText(line, x, y);
  });
}

/**
 * Process image and create carousel slide
 */
export async function createCarouselSlide(
  photo: File | string,
  text: string,
  customization: TextCustomization,
  _slideNumber: number
): Promise<string> {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Load and draw image
  const img = await loadImage(photo);
  
  // Calculate scaling to cover canvas while maintaining aspect ratio
  const imgAspect = img.width / img.height;
  const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
  
  let drawWidth = CANVAS_WIDTH;
  let drawHeight = CANVAS_HEIGHT;
  let drawX = 0;
  let drawY = 0;

  if (imgAspect > canvasAspect) {
    // Image is wider, fit height
    drawHeight = CANVAS_HEIGHT;
    drawWidth = drawHeight * imgAspect;
    drawX = (CANVAS_WIDTH - drawWidth) / 2;
  } else {
    // Image is taller, fit width
    drawWidth = CANVAS_WIDTH;
    drawHeight = drawWidth / imgAspect;
    drawY = (CANVAS_HEIGHT - drawHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

  // Draw background overlay if enabled
  if (customization.backgroundOverlay) {
    drawOverlay(ctx, customization.overlayOpacity);
  }

  // Calculate text height for positioning (before drawing)
  // Save context state
  ctx.save();
  const fontSize = customization.fontSize || 72; // Default to 72 if not set
  const lineHeight = fontSize * 1.4;
  ctx.font = `${fontSize}px ${getFontStyle(customization.fontStyle)}`;
  const maxWidth = CANVAS_WIDTH - 160;
  const lines = wrapText(ctx, text, maxWidth);
  const textHeight = lines.length * lineHeight;
  const outlineWidth = customization.outlineWidth || 5;
  // Restore context state
  ctx.restore();

  // Draw text
  const textY = getTextPosition(customization.textPosition, textHeight, outlineWidth);
  drawText(ctx, text, customization, textY);

  // Convert to data URL
  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Generate all carousel slides
 */
export async function generateCarouselSlides(
  photo: File | string,
  textSegments: string[],
  customization: TextCustomization
): Promise<string[]> {
  const slides: string[] = [];

  for (let i = 0; i < textSegments.length; i++) {
    const slide = await createCarouselSlide(
      photo,
      textSegments[i],
      customization,
      i + 1
    );
    slides.push(slide);
  }

  return slides;
}

