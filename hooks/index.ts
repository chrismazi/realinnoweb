/**
 * Hooks Index
 * Export all custom hooks from a single entry point
 */

// Performance hooks
export { 
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
  useInfiniteScroll
} from './usePerformance';

// Authentication hook
export { default as useAuth, useAuth as useAuthentication } from './useAuth';

// Search and filter hooks
export { useSearch, useFilter, useSearchFilter, useSort } from './useSearch';
