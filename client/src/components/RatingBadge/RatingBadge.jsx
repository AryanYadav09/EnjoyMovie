import React from 'react';
import { Star } from 'lucide-react';

export function RatingBadge({ imdbRating, tmdbRating, size = 'md' }) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  // If IMDb rating is available, show IMDb as primary
  if (imdbRating && imdbRating > 0) {
    return (
      <div 
        className={`inline-flex items-center gap-1 font-outfit font-bold rounded-full border border-gold-cinema/40 bg-gold-cinema/15 text-gold-cinema tnum ${
          isSmall ? 'px-2 py-0.5 text-xs' : isLarge ? 'px-3.5 py-1.5 text-base' : 'px-2.5 py-1 text-xs'
        }`}
        title="Official IMDb Rating"
      >
        <Star className={isSmall ? 'w-3 h-3 fill-gold-cinema' : isLarge ? 'w-4 h-4 fill-gold-cinema' : 'w-3.5 h-3.5 fill-gold-cinema'} />
        <span>IMDb {imdbRating.toFixed(1)}</span>
      </div>
    );
  }

  // Fallback to TMDB rating clearly labeled
  if (tmdbRating && tmdbRating > 0) {
    return (
      <div 
        className={`inline-flex items-center gap-1 font-outfit font-semibold rounded-full border border-cyan-vivid/30 bg-cyan-vivid/10 text-cyan-vivid tnum ${
          isSmall ? 'px-2 py-0.5 text-xs' : isLarge ? 'px-3.5 py-1.5 text-base' : 'px-2.5 py-1 text-xs'
        }`}
        title="Official TMDB Score"
      >
        <span>TMDB {tmdbRating.toFixed(1)}</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-full border border-white/10 bg-white/5 text-cinema-muted text-xs ${
      isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1'
    }`}>
      <span>Unrated</span>
    </div>
  );
}

export function DualRatingDisplay({ imdbRating, imdbVotes, tmdbRating, tmdbVotes }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {imdbRating ? (
        <div className="flex items-center gap-2 bg-gold-cinema/10 border border-gold-cinema/30 px-3 py-1.5 rounded-lg">
          <Star className="w-4 h-4 text-gold-cinema fill-gold-cinema" />
          <div className="flex flex-col leading-none">
            <span className="text-xs text-gold-cinema font-bold font-outfit tnum">IMDb {imdbRating.toFixed(1)}</span>
            {imdbVotes && <span className="text-[10px] text-cinema-muted mt-0.5">{imdbVotes.toLocaleString()} votes</span>}
          </div>
        </div>
      ) : null}

      {tmdbRating ? (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-cyan-vivid animate-pulse" />
          <div className="flex flex-col leading-none">
            <span className="text-xs text-cinema-heading font-semibold font-outfit tnum">TMDB {tmdbRating.toFixed(1)}</span>
            {tmdbVotes && <span className="text-[10px] text-cinema-muted mt-0.5">{tmdbVotes.toLocaleString()} votes</span>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
