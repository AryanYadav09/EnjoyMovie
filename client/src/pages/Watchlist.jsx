import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Compass, Film } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { MovieGrid } from '../components/MovieGrid/MovieGrid';

export function Watchlist({ onWatchTrailer }) {
  const { watchlist, clearWatchlist, count } = useWatchlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cinema-stroke">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-cinema-heading flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 text-amber-accent fill-amber-accent" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            {count === 1 ? '1 movie saved' : `${count} movies saved`} in your local browser collection.
          </p>
        </div>

        {count > 0 && (
          <button
            onClick={clearWatchlist}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-2 hover:bg-red-500/20 text-cinema-muted hover:text-red-400 border border-cinema-stroke hover:border-red-500/30 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Watchlist</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl glass-surface">
          <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center text-amber-accent mb-4 border border-white/10">
            <Bookmark className="w-8 h-8 opacity-50" />
          </div>
          <h2 className="font-outfit text-xl font-bold text-cinema-heading mb-2">
            Your Watchlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-cinema-muted max-w-md mb-6 leading-relaxed">
            Whenever you spot an intriguing movie while discovering genres or reading reviews, click the bookmark button on its poster to save it here for movie night.
          </p>
          <Link
            to="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep shadow-cinema-glow transition-all active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <span>Start Exploring Movies</span>
          </Link>
        </div>
      ) : (
        <MovieGrid
          movies={watchlist}
          onWatchTrailer={onWatchTrailer}
        />
      )}
    </div>
  );
}
