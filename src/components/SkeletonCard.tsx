import { memo } from 'react';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div
      className={`card p-5 space-y-3 ${className}`}
      role="status"
      aria-label="Loading content"
      aria-busy="true"
    >
      <div className="skeleton h-4 w-1/3 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export default memo(SkeletonCard);
