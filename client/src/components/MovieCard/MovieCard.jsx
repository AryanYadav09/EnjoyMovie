import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Play, Film, Info } from 'lucide-react';
import { RatingBadge } from '../RatingBadge/RatingBadge';
import { useWatchlist } from '../../context/WatchlistContext';
import { useActivity } from '../../context/ActivityContext';

export function MovieCard({ movie, onWatchTrailer }) {
  const navigate = useNavigate();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { recordMovieClick, recordWatchlistAdd } = useActivity();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
    if (!inWatchlist) {
      recordWatchlistAdd(movie);
    }
  };

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWatchTrailer) {
      onWatchTrailer(movie);
    } else {
      navigate(`/movie/${movie.id}?playTrailer=true`);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl overflow-hidden bg-surface-2 border border-cinema-stroke hover:border-amber-accent/50 transition-all duration-300 ease-out hover:scale-[1.04] hover:shadow-2xl hover:shadow-black/90 z-10 hover:z-30">
      {/* Poster Image Container (2:3 aspect ratio) */}
      <Link
        to={`/movie/${movie.id}`}
        onClick={() => recordMovieClick(movie)}
        className="relative block w-full aspect-poster overflow-hidden bg-surface-1"
      >
        {movie.poster && !imageError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-2 text-cinema-muted p-6 text-center">
            <Film className="w-12 h-12 mb-3 opacity-30 text-amber-accent" />
            <span className="text-sm font-semibold text-cinema-body line-clamp-2">{movie.title}</span>
          </div>
        )}

        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-surface-3 animate-pulse" />
        )}

        {/* Top Badges: Rating & Watchlist Quick Action */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <div className="pointer-events-auto backdrop-blur-md rounded-full shadow-lg">
            <RatingBadge imdbRating={movie.imdbRating} tmdbRating={movie.tmdbRating} size="md" />
          </div>

          <button
            onClick={handleWatchlistClick}
            aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 shadow-lg ${
              inWatchlist
                ? 'bg-amber-accent text-canvas border-amber-accent shadow-cinema-glow scale-105'
                : 'bg-black/60 text-cinema-heading border-white/20 hover:bg-amber-accent hover:text-canvas hover:border-amber-accent hover:scale-105'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Hover Action Overlay Drawer (Netflix-style) */}
        <div className="absolute inset-0 poster-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          <div className="flex items-center gap-2.5 mb-2.5">
            <button
              onClick={handleTrailerClick}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-amber-accent text-canvas text-xs sm:text-sm font-bold hover:bg-amber-deep transition-all shadow-cinema-glow active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Trailer</span>
            </button>

            <Link
              to={`/movie/${movie.id}`}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-cinema-heading flex items-center justify-center transition-all hover:scale-105"
              title="View full details"
            >
              <Info className="w-4 h-4" />
            </Link>
          </div>

          {movie.overview && (
            <p className="text-xs text-cinema-body/95 line-clamp-3 leading-relaxed">
              {movie.overview}
            </p>
          )}
        </div>
      </Link>

      {/* Card Footer Metadata (Spacious, Netflix Typography) */}
      <div className="p-4 sm:p-4.5 flex flex-col flex-grow justify-between bg-surface-2/95">
        <div>
          <Link to={`/movie/${movie.id}`} onClick={() => recordMovieClick(movie)}>
            <h3 className="font-outfit font-bold text-base sm:text-lg text-cinema-heading line-clamp-1 hover:text-amber-accent transition-colors leading-snug">
              {movie.title}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-cinema-muted">
            {movie.year && <span className="font-medium">{movie.year}</span>}
            {movie.year && movie.genres?.length > 0 && <span>•</span>}
            {movie.genres?.length > 0 && (
              <span className="line-clamp-1 font-medium text-cinema-body/80">{movie.genres.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>

        {/* Micro specs: Votes or Runtime & Quality Score */}
        <div className="mt-3 pt-2.5 border-t border-cinema-stroke/80 flex items-center justify-between text-xs text-cinema-muted">
          <span>{movie.formattedRuntime || (movie.tmdbVotes ? `${movie.formattedTmdbVotes} votes` : '')}</span>
          {movie.qualityScore && (
            <span className="text-amber-accent font-bold font-outfit text-xs sm:text-sm flex items-center gap-1" title="Calculated Quality Score">
              <span>★</span>
              <span>{movie.qualityScore}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
