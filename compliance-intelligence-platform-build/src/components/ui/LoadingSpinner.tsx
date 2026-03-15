import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-navy-200 border-t-navy-600',
          sizeClasses[size]
        )}
      />
      {label && <p className="text-sm text-gray-500 animate-pulse">{label}</p>}
    </div>
  );
};

// Full page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-xl shadow-xl">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-navy-200 border-t-navy-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-navy-600 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <div className="flex gap-1">
          <div className="h-2 w-2 bg-navy-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="h-2 w-2 bg-navy-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="h-2 w-2 bg-navy-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

// Skeleton loader for content
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
}) => {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'text' && lines > 1) {
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(baseClasses, variantClasses[variant])}
            style={{
              ...style,
              width: index === lines - 1 ? '75%' : '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6 space-y-4', className)}>
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} variant="rectangular" />
        <Skeleton width={80} height={32} variant="rectangular" />
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number; className?: string }> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('bg-white rounded-lg shadow overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} width={`${100 / columns}%`} height={16} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-100 px-4 py-4 flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={`${100 / columns}%`}
              height={14}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Stats card skeleton
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton width={100} height={14} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
      <Skeleton width={80} height={32} className="mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton width={40} height={16} />
        <Skeleton width={60} height={12} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
