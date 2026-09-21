import React from 'react';
import { MovieCard } from '../MovieCard/MovieCard';
import { Film } from 'lucide-react';

export function MovieGrid({ movies = [], onWatchTrailer, emptyMessage = 'No movies found.' }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl glass-surface my-6">
        <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center mb-4 text-cinema-muted">
          <Film className="w-8 h-8 opacity-40 text-amber-accent" />
        </div>
        <h3 className="font-outfit text-lg font-semibold text-cinema-heading mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-cinema-muted max-w-md">
          Try loosening your filter criteria, lowering the minimum rating, or exploring other genre combinations.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} onWatchTrailer={onWatchTrailer} />
      ))}
    </div>
  );
}
