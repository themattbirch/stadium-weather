// /utils/storage.ts

/**
 * Checks if localStorage is available.
 * (Some contexts block localStorage usage.)
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const storage = window.localStorage;
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely sets an item to localStorage (or fallback if blocked).
 */
export function safeSetItem(key: string, value: string): void {
  try {
    if (!isStorageAvailable()) {
      console.warn('localStorage not available; using fallback in-memory storage.');
      (window as any).__fallbackStorage = (window as any).__fallbackStorage || {};
      (window as any).__fallbackStorage[key] = value;
      return;
    }
    window.localStorage.setItem(key, value);
  } catch (err) {
    console.warn('Storage not available:', err);
    (window as any).__fallbackStorage = (window as any).__fallbackStorage || {};
    (window as any).__fallbackStorage[key] = value;
  }
}

/**
 * Safely retrieves an item from localStorage (or fallback).
 */
export function safeGetItem(key: string): string | null {
  try {
    if (!isStorageAvailable()) {
      return (window as any).__fallbackStorage?.[key] || null;
    }
    return window.localStorage.getItem(key);
  } catch (err) {
    console.warn('Storage not available:', err);
    return (window as any).__fallbackStorage?.[key] || null;
  }
}
