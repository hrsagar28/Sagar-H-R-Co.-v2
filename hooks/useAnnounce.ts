
import { useAnnounceContext } from '../context/AnnounceContext';

/**
 * Hook to announce messages to screen readers via a live region.
 * 
 * @returns {object} An object containing the `announce` function.
 * 
 * @example
 * const { announce } = useAnnounce();
 * announce('Navigation menu opened', 'polite');
 */
export const useAnnounce = useAnnounceContext;
