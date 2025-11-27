import { useEffect, useRef } from 'react';

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