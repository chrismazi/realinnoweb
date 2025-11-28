/**
 * Performance Optimization Hooks
 * Custom hooks for optimizing React component performance
 */

import React, { useCallback, useEffect, useRef, useState, useMemo, DependencyList } from 'react';

/**
 * Debounce hook - delays invoking a function until after wait milliseconds
 */
export const useDebounce = <T>(value: T, delay: number = 500): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook - limits function calls to once per specified time period
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): T => {
  const lastRun = useRef(Date.now());
  const timeout = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun.current;

      if (timeSinceLastRun >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - timeSinceLastRun);
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Lazy load hook - only loads data when component is visible
 */
export const useLazyLoad = <T>(
  loadFunction: () => Promise<T>,
  dependencies: DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible && !data && !loading) {
      setLoading(true);
      loadFunction()
        .then(setData)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [isVisible, ...dependencies]);

  return { data, loading, error, elementRef };
};

/**
 * Previous value hook - keeps track of previous value
 */
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Mount status hook - checks if component is mounted
 */
export const useIsMounted = (): (() => boolean) => {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
};

/**
 * Async effect hook - handles async operations in useEffect safely
 */
export const useAsyncEffect = (
  effect: () => Promise<void | (() => void)>,
  deps?: DependencyList
): void => {
  const isMounted = useIsMounted();

  useEffect(() => {
    let cleanup: void | (() => void);

    const executeEffect = async () => {
      try {
        cleanup = await effect();
      } catch (error) {
        if (isMounted()) {
          console.error('useAsyncEffect error:', error);
        }
      }
    };

    executeEffect();

    return () => {
      if (cleanup) cleanup();
    };
  }, deps);
};

/**
 * Local storage hook with sync across tabs
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }

        // Save state
        setStoredValue(valueToStore);

        // Dispatch custom event to sync across tabs
        window.dispatchEvent(new Event('local-storage'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Listen for changes in other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue];
};

/**
 * Window size hook
 */
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

/**
 * Media query hook
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

/**
 * Click outside hook
 */
export const useClickOutside = (
  handler: () => void
): React.RefObject<HTMLDivElement> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
};

/**
 * Keyboard shortcut hook
 */
export const useKeyPress = (
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    preventDefault?: boolean;
  } = {}
): void => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (
        event.key === targetKey &&
        (!options.ctrl || event.ctrlKey) &&
        (!options.shift || event.shiftKey) &&
        (!options.alt || event.altKey)
      ) {
        if (options.preventDefault) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [targetKey, handler, options]);
};

/**
 * Infinite scroll hook
 */
export const useInfiniteScroll = (
  callback: () => void,
  options: {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
  } = {}
) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            callback();
          }
        },
        {
          threshold: options.threshold || 0,
          root: options.root || null,
          rootMargin: options.rootMargin || '0px',
        }
      );
      
      if (node) observer.current.observe(node);
    },
    [callback, options]
  );

  return lastElementRef;
};

export default {
  useDebounce,
  useThrottle,
  useLazyLoad,
  usePrevious,
  useIsMounted,
  useAsyncEffect,
  useLocalStorage,
  useWindowSize,
  useMediaQuery,
  useClickOutside,
  useKeyPress,
  useInfiniteScroll,
};
