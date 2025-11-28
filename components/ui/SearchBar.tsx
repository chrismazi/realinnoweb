/**
 * Reusable Search Bar Component
 * With debouncing and clear functionality
 */

import React, { memo, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
}

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = memo(({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  isLoading = false,
  onClear,
  autoFocus = false,
}) => {
  const handleClear = useCallback(() => {
    onChange('');
    onClear?.();
  }, [onChange, onClear]);

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        <SearchIcon />
      </div>
      
      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-all"
      />
      
      {/* Loading or Clear Icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        {isLoading ? (
          <div className="text-slate-400">
            <LoadingSpinner />
          </div>
        ) : value ? (
          <button
            onClick={handleClear}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
          >
            <ClearIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

// Filter Chips Component
interface FilterChipsProps {
  filters: { key: string; label: string; active: boolean }[];
  onToggle: (key: string) => void;
  className?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = memo(({
  filters,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`flex gap-2 overflow-x-auto no-scrollbar ${className}`}>
      {filters.map(filter => (
        <button
          key={filter.key}
          onClick={() => onToggle(filter.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter.active
              ? 'bg-brand text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
});

FilterChips.displayName = 'FilterChips';

// Sort Dropdown Component
interface SortOption {
  key: string;
  label: string;
}

interface SortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = memo(({
  options,
  value,
  onChange,
  className = '',
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand/50 ${className}`}
    >
      {options.map(option => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

SortDropdown.displayName = 'SortDropdown';

export default SearchBar;
