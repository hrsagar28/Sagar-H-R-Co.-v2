
import { useState } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook that syncs state to local storage so that it persists through page refreshes.
 * Includes error handling for quota limits.
 * 
 * @template T
 * @param {string} key - The key to use in localStorage.
 * @param {T} initialValue - The initial value to use if no value is found in localStorage.
 * @returns {[T, (value: T | ((prev: T) => T)) => void]} Stored value and setter function.
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      logger.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
          if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            logger.warn('localStorage quota exceeded.');
            // Dispatch global event to notify user via Toast
            window.dispatchEvent(new CustomEvent('app-toast', { 
              detail: { 
                message: 'Failed to save progress. Storage is full. Please clear browser cache.', 
                variant: 'warning' 
              } 
            }));
          } else {
            throw e;
          }
        }
      }
    } catch (error) {
      logger.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
