

/**
 * Skeleton loading components for content placeholders.
 */

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton h-6 w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-4 mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4 }) {
  return (
    <div className="skeleton-card space-y-4">
      <div className="skeleton h-6 w-1/3 mb-2" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="skeleton h-3 w-1/4 mb-2" />
          <div className="skeleton h-12 w-full" />
        </div>
      ))}
      <div className="skeleton h-12 w-full mt-4 !bg-primary-200" />
    </div>
  );
}

export function SkeletonResults() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="skeleton-circle h-8 w-8" />
              <div>
                <div className="skeleton h-5 w-32 mb-2" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
            <div className="skeleton h-8 w-20 rounded-full" />
          </div>
          <div className="skeleton h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="text-center">
          <div className="skeleton-circle h-5 w-5 mx-auto mb-2" />
          <div className="skeleton h-7 w-12 mx-auto mb-2" />
          <div className="skeleton h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}
