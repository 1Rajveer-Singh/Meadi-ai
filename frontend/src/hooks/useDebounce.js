import { useState, useEffect, useCallback } from 'react';

/**
 * Enhanced custom hook for debouncing values with additional features:
 * - Default delay value
 * - Leading edge option (immediate execution on first call)
 * - Callback for tracking pending state
 * - Force immediate update option
 * 
 * Useful for search inputs, form controls, and UI that should respond
 * to user input without triggering immediate expensive operations
 * 
 * @param {any} value - The value to debounce
 * @param {number} delay - The delay in milliseconds (default: 500ms)
 * @param {Object} options - Additional options
 * @param {boolean} options.leading - Whether to execute on the leading edge (default: false)
 * @param {Function} options.onPending - Callback when debounce state changes (receives pending boolean)
 * @returns {Object} - { debouncedValue, isPending, forceUpdate }
 * 
 * @example
 * // Basic usage
 * const [searchTerm, setSearchTerm] = useState('');
 * const { debouncedValue, isPending } = useDebounce(searchTerm, 300);
 * 
 * // Advanced usage with all options
 * const { debouncedValue, isPending, forceUpdate } = useDebounce(
 *   searchTerm,
 *   300,
 *   { 
 *     leading: true,
 *     onPending: (pending) => setLoading(pending)
 *   }
 * );
 */
export const useDebounce = (value, delay = 500, options = {}) => {
  const { leading = false, onPending = null } = options;
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);

  // Force immediate update regardless of delay
  const forceUpdate = useCallback(() => {
    setDebouncedValue(value);
    setIsPending(false);
    if (onPending) onPending(false);
  }, [value, onPending]);

  useEffect(() => {
    // Handle leading edge case (immediate execution on first value change)
    if (leading && isFirstRender) {
      setDebouncedValue(value);
      setIsFirstRender(false);
      return;
    }

    // Set pending state
    setIsPending(true);
    if (onPending) onPending(true);
    
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
      if (onPending) onPending(false);
    }, delay);

    // Clear the timeout if the value changes before the delay expires
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, leading, isFirstRender, onPending]);

  return { debouncedValue, isPending, forceUpdate };
};