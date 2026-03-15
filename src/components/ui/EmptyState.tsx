import React from 'react';
import { 
  FileSearch, 
  Upload, 
  Plus, 
  Search,
  FolderOpen,
  Database,
  FileX,
  AlertCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

type EmptyStateType = 
  | 'no-data'
  | 'no-results'
  | 'no-files'
  | 'empty-folder'
  | 'error'
  | 'no-filter-results'
  | 'first-time';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const defaultContent: Record<EmptyStateType, { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}> = {
  'no-data': {
    icon: <Database className="h-12 w-12 text-gray-400" />,
    title: 'No data available',
    description: 'There\'s no data to display at the moment. Start by adding some records.',
  },
  'no-results': {
    icon: <FileSearch className="h-12 w-12 text-gray-400" />,
    title: 'No results found',
    description: 'We couldn\'t find anything matching your search. Try adjusting your search terms.',
  },
  'no-files': {
    icon: <FileX className="h-12 w-12 text-gray-400" />,
    title: 'No files uploaded',
    description: 'You haven\'t uploaded any files yet. Upload a file to get started.',
  },
  'empty-folder': {
    icon: <FolderOpen className="h-12 w-12 text-gray-400" />,
    title: 'This folder is empty',
    description: 'There are no items in this folder. Add some items to see them here.',
  },
  'error': {
    icon: <AlertCircle className="h-12 w-12 text-red-400" />,
    title: 'Something went wrong',
    description: 'We encountered an error while loading this content. Please try again.',
  },
  'no-filter-results': {
    icon: <Filter className="h-12 w-12 text-gray-400" />,
    title: 'No matching results',
    description: 'No items match your current filters. Try adjusting or clearing your filters.',
  },
  'first-time': {
    icon: <Plus className="h-12 w-12 text-blue-400" />,
    title: 'Get started',
    description: 'Welcome! Create your first item to begin using this feature.',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const content = defaultContent[type];
  const displayTitle = title || content.title;
  const displayDescription = description || content.description;
  const displayIcon = icon || content.icon;

  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'mb-3',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'mb-4',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'mb-6',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        sizes.container,
        className
      )}
    >
      {/* Icon */}
      <div className={cn('flex items-center justify-center', sizes.icon)}>
        {displayIcon}
      </div>

      {/* Title */}
      <h3 className={cn('font-semibold text-gray-900 mb-2', sizes.title)}>
        {displayTitle}
      </h3>

      {/* Description */}
      <p className={cn('text-gray-500 max-w-sm mb-6', sizes.description)}>
        {displayDescription}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.icon || (type === 'no-files' ? <Upload className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />)}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized empty states
export const NoSearchResults: React.FC<{
  query: string;
  onClear?: () => void;
}> = ({ query, onClear }) => (
  <EmptyState
    type="no-results"
    title="No results found"
    description={`We couldn't find anything for "${query}". Try a different search term.`}
    icon={<Search className="h-12 w-12 text-gray-400" />}
    action={onClear ? { label: 'Clear search', onClick: onClear } : undefined}
  />
);

export const NoFilterResults: React.FC<{
  onClearFilters?: () => void;
}> = ({ onClearFilters }) => (
  <EmptyState
    type="no-filter-results"
    action={onClearFilters ? {
      label: 'Clear all filters',
      onClick: onClearFilters,
      icon: <RefreshCw className="h-4 w-4 mr-2" />,
    } : undefined}
  />
);

export const UploadPrompt: React.FC<{
  onUpload: () => void;
  fileTypes?: string;
}> = ({ onUpload, fileTypes }) => (
  <EmptyState
    type="no-files"
    description={fileTypes ? `Upload ${fileTypes} files to get started.` : 'Upload a file to get started.'}
    action={{
      label: 'Upload file',
      onClick: onUpload,
      icon: <Upload className="h-4 w-4 mr-2" />,
    }}
  />
);

export const ErrorState: React.FC<{
  onRetry?: () => void;
  errorMessage?: string;
}> = ({ onRetry, errorMessage }) => (
  <EmptyState
    type="error"
    description={errorMessage || 'We encountered an error while loading this content. Please try again.'}
    action={onRetry ? {
      label: 'Try again',
      onClick: onRetry,
      icon: <RefreshCw className="h-4 w-4 mr-2" />,
    } : undefined}
  />
);

export default EmptyState;
