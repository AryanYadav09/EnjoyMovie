import React from 'react';

export function CardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-surface-2 border border-cinema-stroke animate-pulse">
      <div className="w-full aspect-poster bg-surface-3/80" />
      <div className="p-4 space-y-2.5">
        <div className="h-5 bg-surface-3 rounded w-3/4" />
        <div className="h-3.5 bg-surface-3/60 rounded w-1/2" />
        <div className="pt-3 border-t border-cinema-stroke flex justify-between">
          <div className="h-3 bg-surface-3/40 rounded w-1/3" />
          <div className="h-3 bg-amber-accent/20 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="min-h-screen animate-pulse pb-16">
      <div className="w-full h-[450px] bg-surface-2/60 relative">
        <div className="max-w-7xl mx-auto px-4 pt-48 flex gap-8">
          <div className="w-56 aspect-poster rounded-xl bg-surface-3 flex-shrink-0" />
          <div className="space-y-4 flex-1 pt-12">
            <div className="h-8 bg-surface-3 rounded w-1/2" />
            <div className="h-4 bg-surface-3/60 rounded w-1/4" />
            <div className="flex gap-2">
              <div className="h-8 w-24 bg-surface-3 rounded-full" />
              <div className="h-8 w-24 bg-surface-3 rounded-full" />
            </div>
            <div className="h-16 bg-surface-3/50 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}
