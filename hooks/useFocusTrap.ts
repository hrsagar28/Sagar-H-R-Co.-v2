import { useEffect, RefObject } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    (element.offsetParent !== null || style.position === 'fixed')
  );
};

const getFocusableElements = (element: HTMLElement) =>
  Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (node) =>
      !node.matches('[disabled], [aria-hidden="true"], [tabindex="-1"]') &&
      !node.closest('[aria-hidden="true"]') &&
      isVisible(node),
  );

/**
 * Hook to trap focus within a container when active (e.g., for modals/menus).
 * Handles Tab and Shift+Tab navigation to cycle through focusable elements.
 *
 * @param {boolean} isActive - Whether the trap is currently active.
 * @param {RefObject<HTMLElement>} containerRef - Ref to the container element.
 * @param {() => void} [onEscape] - Optional callback when Escape key is pressed.
 */
export const useFocusTrap = (isActive: boolean, containerRef: RefObject<HTMLElement>, onEscape?: () => void) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const element = containerRef.current;
    let focusableElements: HTMLElement[] = [];
    let firstElement: HTMLElement | undefined;
    let lastElement: HTMLElement | undefined;
    let rafId = 0;
    let focusTimer: ReturnType<typeof setTimeout> | undefined;

    const refreshFocusableElements = () => {
      focusableElements = getFocusableElements(element);
      firstElement = focusableElements[0];
      lastElement = focusableElements[focusableElements.length - 1];
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (!firstElement || !lastElement) {
        refreshFocusableElements();
      }
      if (!firstElement || !lastElement) return;

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    rafId = window.requestAnimationFrame(() => {
      refreshFocusableElements();
      if (!firstElement) return;

      focusTimer = setTimeout(() => {
        firstElement?.focus();
      }, 100);
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.cancelAnimationFrame(rafId);
      if (focusTimer) clearTimeout(focusTimer);
    };
  }, [isActive, containerRef, onEscape]);
};
