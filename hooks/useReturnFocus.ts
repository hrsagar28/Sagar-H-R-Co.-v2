
import { useEffect, useRef } from 'react';

/**
 * Hook to restore focus to the previously focused element when a component (like a modal) unmounts or closes.
 * 
 * @param {boolean} isOpen - Boolean indicating if the modal/overlay is currently open.
 */
export const useReturnFocus = (isOpen: boolean) => {
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      lastFocusedElement.current = document.activeElement as HTMLElement;
    } else if (lastFocusedElement.current && !isOpen) {
      // Small delay to allow the modal to unmount/close completely
      setTimeout(() => {
          lastFocusedElement.current?.focus();
      }, 50);
    }
  }, [isOpen]);
};
