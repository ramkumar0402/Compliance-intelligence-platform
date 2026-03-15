import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const colorStyles = {
  default: 'bg-indigo-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = 'md',
  color = 'default',
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-slate-200 rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 text-sm text-slate-600 text-right">
          {value.toFixed(0)}/{max}
        </div>
      )}
    </div>
  );
}
