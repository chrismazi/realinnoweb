/**
 * Reusable Loading States and Skeleton Screens
 * Provides consistent loading UI across the app
 */

import React from 'react';

// Shimmer animation for skeleton screens
const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent`;

// Skeleton component for loading states
export const Skeleton: React.FC<{
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: boolean;
}> = ({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height,
  animation = true 
}) => {
  const baseClasses = `bg-slate-200 dark:bg-slate-800 ${animation ? shimmer : ''}`;
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };
  
  const style = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%')
  };
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

// Full page loader
export const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-8">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-700 rounded-full animate-pulse"></div>
      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-t-brand border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
      {message}
    </p>
  </div>
);

// Inline spinner
export const Spinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}> = ({ size = 'md', color = 'text-brand', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <svg 
      className={`animate-spin ${sizes[size]} ${color} ${className}`}
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Button with loading state
export const LoadingButton: React.FC<{
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({ 
  loading = false, 
  disabled = false, 
  children, 
  onClick, 
  className = '',
  variant = 'primary' 
}) => {
  const variants = {
    primary: 'bg-brand hover:bg-orange-600 text-white',
    secondary: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        relative px-6 py-3 rounded-xl font-semibold transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" color="text-current" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : ''}>
        {children}
      </span>
    </button>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={16} width="40%" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" height={16} width={`${100 - i * 20}%`} />
      ))}
    </div>
  </div>
);

// Transaction skeleton
export const TransactionSkeleton: React.FC = () => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-xl">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2">
        <Skeleton variant="text" width={120} height={16} />
        <Skeleton variant="text" width={80} height={14} />
      </div>
    </div>
    <Skeleton variant="text" width={60} height={20} />
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
    <div className="space-y-2 mb-4">
      <Skeleton variant="text" width={150} height={20} />
      <Skeleton variant="text" width={100} height={16} />
    </div>
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end gap-2">
          <Skeleton 
            variant="rectangular" 
            height={`${Math.random() * 80 + 20}%`}
            animation={true}
          />
          <Skeleton variant="text" height={12} />
        </div>
      ))}
    </div>
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <TransactionSkeleton key={i} />
    ))}
  </div>
);

// Empty state component
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    {icon && (
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-brand text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);

// Progress bar
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  animated?: boolean;
}> = ({ 
  value, 
  max = 100, 
  color = 'bg-brand',
  height = 8,
  showLabel = false,
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>{value}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div 
        className="w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
        style={{ height }}
      >
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Pulse dot for notifications
export const PulseDot: React.FC<{ color?: string }> = ({ color = 'bg-red-500' }) => (
  <span className="relative flex h-3 w-3">
    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
    <span className={`relative inline-flex rounded-full h-3 w-3 ${color}`}></span>
  </span>
);

export default {
  Skeleton,
  PageLoader,
  Spinner,
  LoadingButton,
  CardSkeleton,
  TransactionSkeleton,
  ChartSkeleton,
  ListSkeleton,
  EmptyState,
  ProgressBar,
  PulseDot
};
