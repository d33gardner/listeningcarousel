/**
 * Platform detection utilities for mobile-specific behavior
 */

export type Platform = 'ios' | 'android' | 'desktop';

/**
 * Detect the current platform
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform?.toLowerCase() || '';

  // Check for iOS (iPhone, iPad, iPod)
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || 
    (platform.includes('mac') && 'ontouchend' in document);

  // Check for Android
  const isAndroid = /android/.test(userAgent);

  if (isIOS) {
    return 'ios';
  }

  if (isAndroid) {
    return 'android';
  }

  return 'desktop';
}

/**
 * Check if Web Share API is supported (with file support)
 */
export function isWebShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 
         'share' in navigator && 
         'canShare' in navigator;
}

/**
 * Check if Web Share API supports files
 */
export function canShareFiles(): boolean {
  if (!isWebShareSupported()) {
    return false;
  }

  // Android Chrome supports file sharing, iOS Safari has limited support
  const platform = detectPlatform();
  return platform === 'android';
}

/**
 * Check if running on mobile device
 */
export function isMobile(): boolean {
  const platform = detectPlatform();
  return platform === 'ios' || platform === 'android';
}

