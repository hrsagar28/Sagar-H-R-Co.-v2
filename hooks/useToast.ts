
import { useToast } from '../context/ToastContext';

/**
 * Hook to access toast notification methods.
 * 
 * @returns {object} Object containing `addToast`, `removeToast`, and `toasts`.
 * 
 * @example
 * const { addToast } = useToast();
 * addToast("Operation successful", "success");
 */
export { useToast };
