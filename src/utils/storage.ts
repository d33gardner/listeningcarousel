import type { TextCustomization } from "../types";

const STORAGE_VERSION = "1.0.0";
const DB_NAME = "carousel_app_db";
const DB_VERSION = 1;
const STORE_NAME = "images";

// localStorage keys
const KEY_PERSIST_ENABLED = "carousel_persistEnabled";
const KEY_TITLE = "carousel_title";
const KEY_STORY_TEXT = "carousel_storyText";
const KEY_CUSTOMIZATION = "carousel_customization";
const KEY_SHOW_NUMBERS = "carousel_showNumbers";
const KEY_PHOTO_PREVIEW = "carousel_photoPreview";
const KEY_CUSTOM_SLIDE_PREVIEWS = "carousel_customSlidePreviews";
const KEY_SLIDE_TEXTS = "carousel_slideTexts";
const KEY_STORAGE_VERSION = "carousel_storageVersion";

// IndexedDB keys
const IDB_KEY_MAIN_PHOTO = "main_photo";
const IDB_KEY_CUSTOM_SLIDE_PHOTO = (index: number) => `custom_slide_photo_${index}`;
const IDB_KEY_GENERATED_SLIDES = "generated_slides";

// Initialize IndexedDB
async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// localStorage utilities
export const localStorageUtils = {
  getPersistEnabled(): boolean {
    try {
      const value = localStorage.getItem(KEY_PERSIST_ENABLED);
      return value !== null ? value === "true" : true; // Default to true
    } catch {
      return true;
    }
  },

  setPersistEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(KEY_PERSIST_ENABLED, String(enabled));
    } catch (err) {
      console.error("Failed to save persist enabled state:", err);
    }
  },

  getTitle(): string {
    try {
      return localStorage.getItem(KEY_TITLE) || "";
    } catch {
      return "";
    }
  },

  setTitle(title: string): void {
    try {
      localStorage.setItem(KEY_TITLE, title);
    } catch (err) {
      console.error("Failed to save title:", err);
    }
  },

  getStoryText(): string {
    try {
      return localStorage.getItem(KEY_STORY_TEXT) || "";
    } catch {
      return "";
    }
  },

  setStoryText(text: string): void {
    try {
      localStorage.setItem(KEY_STORY_TEXT, text);
    } catch (err) {
      console.error("Failed to save story text:", err);
    }
  },

  getCustomization(): TextCustomization | null {
    try {
      const value = localStorage.getItem(KEY_CUSTOMIZATION);
      if (!value) return null;
      return JSON.parse(value) as TextCustomization;
    } catch {
      return null;
    }
  },

  setCustomization(customization: TextCustomization): void {
    try {
      localStorage.setItem(KEY_CUSTOMIZATION, JSON.stringify(customization));
    } catch (err) {
      console.error("Failed to save customization:", err);
    }
  },

  getShowNumbers(): boolean {
    try {
      const value = localStorage.getItem(KEY_SHOW_NUMBERS);
      return value === "true";
    } catch {
      return false;
    }
  },

  setShowNumbers(show: boolean): void {
    try {
      localStorage.setItem(KEY_SHOW_NUMBERS, String(show));
    } catch (err) {
      console.error("Failed to save showNumbers:", err);
    }
  },

  getPhotoPreview(): string | null {
    try {
      return localStorage.getItem(KEY_PHOTO_PREVIEW);
    } catch {
      return null;
    }
  },

  setPhotoPreview(preview: string | null): void {
    try {
      if (preview) {
        localStorage.setItem(KEY_PHOTO_PREVIEW, preview);
      } else {
        localStorage.removeItem(KEY_PHOTO_PREVIEW);
      }
    } catch (err) {
      console.error("Failed to save photo preview:", err);
    }
  },

  getCustomSlidePreviews(): Map<number, string> {
    try {
      const value = localStorage.getItem(KEY_CUSTOM_SLIDE_PREVIEWS);
      if (!value) return new Map();
      const data = JSON.parse(value) as Record<string, string>;
      return new Map(Object.entries(data).map(([k, v]) => [Number(k), v]));
    } catch {
      return new Map();
    }
  },

  setCustomSlidePreviews(previews: Map<number, string>): void {
    try {
      const data = Object.fromEntries(previews);
      localStorage.setItem(KEY_CUSTOM_SLIDE_PREVIEWS, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to save custom slide previews:", err);
    }
  },

  getSlideTexts(): string[] {
    try {
      const value = localStorage.getItem(KEY_SLIDE_TEXTS);
      if (!value) return [];
      return JSON.parse(value) as string[];
    } catch {
      return [];
    }
  },

  setSlideTexts(texts: string[]): void {
    try {
      localStorage.setItem(KEY_SLIDE_TEXTS, JSON.stringify(texts));
    } catch (err) {
      console.error("Failed to save slide texts:", err);
    }
  },

  clearAll(): void {
    try {
      // Preserve persistEnabled preference
      const persistEnabled = this.getPersistEnabled();
      localStorage.removeItem(KEY_TITLE);
      localStorage.removeItem(KEY_STORY_TEXT);
      localStorage.removeItem(KEY_CUSTOMIZATION);
      localStorage.removeItem(KEY_SHOW_NUMBERS);
      localStorage.removeItem(KEY_PHOTO_PREVIEW);
      localStorage.removeItem(KEY_CUSTOM_SLIDE_PREVIEWS);
      localStorage.removeItem(KEY_SLIDE_TEXTS);
      localStorage.setItem(KEY_STORAGE_VERSION, STORAGE_VERSION);
      // Restore persistEnabled preference
      this.setPersistEnabled(persistEnabled);
    } catch (err) {
      console.error("Failed to clear localStorage:", err);
    }
  },
};

// IndexedDB utilities
export const indexedDBUtils = {
  async saveMainPhoto(file: File): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(file, IDB_KEY_MAIN_PHOTO);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save main photo:", err);
      throw err;
    }
  },

  async getMainPhoto(): Promise<File | null> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      return new Promise<File | null>((resolve, reject) => {
        const request = store.get(IDB_KEY_MAIN_PHOTO);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to get main photo:", err);
      return null;
    }
  },

  async deleteMainPhoto(): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(IDB_KEY_MAIN_PHOTO);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to delete main photo:", err);
      throw err;
    }
  },

  async saveCustomSlidePhoto(index: number, file: File): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(file, IDB_KEY_CUSTOM_SLIDE_PHOTO(index));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Failed to save custom slide photo ${index}:`, err);
      throw err;
    }
  },

  async getCustomSlidePhoto(index: number): Promise<File | null> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      return new Promise<File | null>((resolve, reject) => {
        const request = store.get(IDB_KEY_CUSTOM_SLIDE_PHOTO(index));
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Failed to get custom slide photo ${index}:`, err);
      return null;
    }
  },

  async deleteCustomSlidePhoto(index: number): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(IDB_KEY_CUSTOM_SLIDE_PHOTO(index));
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error(`Failed to delete custom slide photo ${index}:`, err);
      throw err;
    }
  },

  async getAllCustomSlidePhotos(): Promise<Map<number, File>> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const result = new Map<number, File>();

      return new Promise<Map<number, File>>((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const key = cursor.key as string;
            if (key.startsWith("custom_slide_photo_")) {
              const index = Number(key.replace("custom_slide_photo_", ""));
              if (!isNaN(index)) {
                result.set(index, cursor.value as File);
              }
            }
            cursor.continue();
          } else {
            resolve(result);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to get custom slide photos:", err);
      return new Map();
    }
  },

  async saveGeneratedSlides(slides: string[]): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.put(slides, IDB_KEY_GENERATED_SLIDES);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to save generated slides:", err);
      throw err;
    }
  },

  async getGeneratedSlides(): Promise<string[] | null> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      return new Promise<string[] | null>((resolve, reject) => {
        const request = store.get(IDB_KEY_GENERATED_SLIDES);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to get generated slides:", err);
      return null;
    }
  },

  async clearAll(): Promise<void> {
    try {
      const db = await getDB();
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("Failed to clear IndexedDB:", err);
      throw err;
    }
  },
};

// Combined utilities
export const storageUtils = {
  async clearAll(): Promise<void> {
    localStorageUtils.clearAll();
    try {
      await indexedDBUtils.clearAll();
    } catch (err) {
      console.error("Failed to clear IndexedDB:", err);
    }
  },
};

