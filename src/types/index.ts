export interface TextCustomization {
  fontStyle: 'modern' | 'classic' | 'bold';
  textColor: string;
  textPosition: 'top' | 'center' | 'bottom';
  backgroundOverlay: boolean;
  overlayOpacity: number;
  outlineWidth: number; // 5-30 pixels
}

export interface CarouselSlide {
  id: number;
  text: string;
  imageData: string; // base64 or data URL
}

export interface AppState {
  photo: File | null;
  photoPreview: string | null;
  storyText: string;
  slides: CarouselSlide[];
  customization: TextCustomization;
}

