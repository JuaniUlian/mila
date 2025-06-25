
import type React from 'react';
import { cn } from '@/lib/utils';
import type { AlertLevel } from './types';
import { AlertCircle, AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

interface SeverityIndicatorProps {
  level: AlertLevel;
  size?: number;
  className?: string;
}

export function SeverityIndicator({ level, size = 5, className }: SeverityIndicatorProps) {
  const iconSizeClass = `h-${size} w-${size}`;

  switch (level) {
    case 'grave':
      return <AlertOctagon className={cn('text-custom-severity-high', iconSizeClass, className)} aria-label="Grave" />;
    case 'media':
      return <AlertTriangle className={cn('text-custom-severity-medium', iconSizeClass, className)} aria-label="Media" />;
    case 'leve':
      return <AlertCircle className={cn('text-custom-severity-low', iconSizeClass, className)} aria-label="Leve" />;
    case 'none':
       return <CheckCircle className={cn('text-green-500', iconSizeClass, className)} aria-label="None" />;
    default:
      return null;
  }
}

// A simpler dot indicator if preferred for some contexts
export function SeverityDotIndicator({ level, size = 'sm', className }: { level: AlertLevel, size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-2.5 w-2.5',
    md: 'h-3 w-3',
    lg: 'h-4 w-4',
  };

  const colorClasses = {
    grave: 'bg-custom-severity-high',
    media: 'bg-custom-severity-medium',
    leve: 'bg-custom-severity-low',
    none: 'bg-green-500',
  };

  return (
    <span
      className={cn(
        'inline-block rounded-full',
        sizeClasses[size],
        colorClasses[level],
        className
      )}
      aria-label={`Severity: ${level}`}
    />
  );
}
