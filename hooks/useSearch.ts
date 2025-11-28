/**
 * Search and Filter Hook
 * Generic hook for searching and filtering lists with debouncing
 */

import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './usePerformance';

interface UseSearchOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  initialQuery?: string;
  debounceMs?: number;
}

interface UseSearchReturn<T> {
  query: string;
  setQuery: (query: string) => void;
  results: T[];
  isSearching: boolean;
  clearSearch: () => void;
  resultCount: number;
  hasResults: boolean;
}

/**
 * Hook for searching through a list of items
 */
export function useSearch<T extends Record<string, any>>({
  data,
  searchFields,
  initialQuery = '',
  debounceMs = 300,
}: UseSearchOptions<T>): UseSearchReturn<T> {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, debounceMs);
  const isSearching = query !== debouncedQuery;

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return data;
    }

    const searchTerms = debouncedQuery.toLowerCase().split(' ').filter(Boolean);

    return data.filter(item => {
      return searchTerms.every(term => {
        return searchFields.some(field => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(term);
        });
      });
    });
  }, [data, debouncedQuery, searchFields]);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
    resultCount: results.length,
    hasResults: results.length > 0,
  };
}

// ============================================
// Filter Hook
// ============================================

type FilterValue = string | number | boolean | null;
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';

interface FilterConfig<T> {
  field: keyof T;
  operator: FilterOperator;
  value: FilterValue | FilterValue[];
}

interface UseFilterOptions<T> {
  data: T[];
  initialFilters?: FilterConfig<T>[];
}

interface UseFilterReturn<T> {
  filters: FilterConfig<T>[];
  setFilter: (field: keyof T, operator: FilterOperator, value: FilterValue | FilterValue[]) => void;
  removeFilter: (field: keyof T) => void;
  clearFilters: () => void;
  results: T[];
  activeFilterCount: number;
}

/**
 * Hook for filtering a list of items
 */
export function useFilter<T extends Record<string, any>>({
  data,
  initialFilters = [],
}: UseFilterOptions<T>): UseFilterReturn<T> {
  const [filters, setFilters] = useState<FilterConfig<T>[]>(initialFilters);

  const setFilter = useCallback((
    field: keyof T,
    operator: FilterOperator,
    value: FilterValue | FilterValue[]
  ) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.field === field);
      const newFilter = { field, operator, value };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newFilter;
        return updated;
      }
      
      return [...prev, newFilter];
    });
  }, []);

  const removeFilter = useCallback((field: keyof T) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const results = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const itemValue = item[filter.field];
        const filterValue = filter.value;

        switch (filter.operator) {
          case 'eq':
            return itemValue === filterValue;
          case 'neq':
            return itemValue !== filterValue;
          case 'gt':
            return typeof itemValue === 'number' && itemValue > (filterValue as number);
          case 'gte':
            return typeof itemValue === 'number' && itemValue >= (filterValue as number);
          case 'lt':
            return typeof itemValue === 'number' && itemValue < (filterValue as number);
          case 'lte':
            return typeof itemValue === 'number' && itemValue <= (filterValue as number);
          case 'contains':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'in':
            return Array.isArray(filterValue) && filterValue.includes(itemValue);
          default:
            return true;
        }
      });
    });
  }, [data, filters]);

  return {
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    results,
    activeFilterCount: filters.length,
  };
}

// ============================================
// Combined Search and Filter
// ============================================

interface UseSearchFilterOptions<T> {
  data: T[];
  searchFields: (keyof T)[];
  initialQuery?: string;
  initialFilters?: FilterConfig<T>[];
  debounceMs?: number;
}

interface UseSearchFilterReturn<T> extends UseSearchReturn<T>, Omit<UseFilterReturn<T>, 'results'> {
  results: T[];
}

/**
 * Combined hook for both searching and filtering
 */
export function useSearchFilter<T extends Record<string, any>>({
  data,
  searchFields,
  initialQuery = '',
  initialFilters = [],
  debounceMs = 300,
}: UseSearchFilterOptions<T>): UseSearchFilterReturn<T> {
  const [query, setQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<FilterConfig<T>[]>(initialFilters);
  
  const debouncedQuery = useDebounce(query, debounceMs);
  const isSearching = query !== debouncedQuery;

  const setFilter = useCallback((
    field: keyof T,
    operator: FilterOperator,
    value: FilterValue | FilterValue[]
  ) => {
    setFilters(prev => {
      const existing = prev.findIndex(f => f.field === field);
      const newFilter = { field, operator, value };
      
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newFilter;
        return updated;
      }
      
      return [...prev, newFilter];
    });
  }, []);

  const removeFilter = useCallback((field: keyof T) => {
    setFilters(prev => prev.filter(f => f.field !== field));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
  }, []);

  // Apply both search and filters
  const results = useMemo(() => {
    let filtered = data;

    // Apply filters first
    if (filters.length > 0) {
      filtered = filtered.filter(item => {
        return filters.every(filter => {
          const itemValue = item[filter.field];
          const filterValue = filter.value;

          switch (filter.operator) {
            case 'eq': return itemValue === filterValue;
            case 'neq': return itemValue !== filterValue;
            case 'gt': return typeof itemValue === 'number' && itemValue > (filterValue as number);
            case 'gte': return typeof itemValue === 'number' && itemValue >= (filterValue as number);
            case 'lt': return typeof itemValue === 'number' && itemValue < (filterValue as number);
            case 'lte': return typeof itemValue === 'number' && itemValue <= (filterValue as number);
            case 'contains': return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'in': return Array.isArray(filterValue) && filterValue.includes(itemValue);
            default: return true;
          }
        });
      });
    }

    // Then apply search
    if (debouncedQuery.trim()) {
      const searchTerms = debouncedQuery.toLowerCase().split(' ').filter(Boolean);
      filtered = filtered.filter(item => {
        return searchTerms.every(term => {
          return searchFields.some(field => {
            const value = item[field];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(term);
          });
        });
      });
    }

    return filtered;
  }, [data, filters, debouncedQuery, searchFields]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch,
    resultCount: results.length,
    hasResults: results.length > 0,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    activeFilterCount: filters.length,
  };
}

// ============================================
// Sorting Hook
// ============================================

type SortDirection = 'asc' | 'desc';

interface UseSortOptions<T> {
  data: T[];
  initialSortField?: keyof T;
  initialDirection?: SortDirection;
}

interface UseSortReturn<T> {
  sortField: keyof T | null;
  sortDirection: SortDirection;
  setSortField: (field: keyof T) => void;
  toggleDirection: () => void;
  results: T[];
  clearSort: () => void;
}

/**
 * Hook for sorting a list of items
 */
export function useSort<T extends Record<string, any>>({
  data,
  initialSortField,
  initialDirection = 'asc',
}: UseSortOptions<T>): UseSortReturn<T> {
  const [sortField, setSortFieldState] = useState<keyof T | null>(initialSortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const setSortField = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortFieldState(field);
      setSortDirection('asc');
    }
  }, [sortField]);

  const toggleDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const clearSort = useCallback(() => {
    setSortFieldState(null);
    setSortDirection('asc');
  }, []);

  const results = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison: number;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else {
        comparison = aVal < bVal ? -1 : 1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    setSortField,
    toggleDirection,
    results,
    clearSort,
  };
}

export default { useSearch, useFilter, useSearchFilter, useSort };
