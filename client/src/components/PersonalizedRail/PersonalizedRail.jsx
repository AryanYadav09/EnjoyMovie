import React, { useState, useEffect, useRef } from 'react';
import { Film, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieApi } from '../../services/api';
import { useActivity } from '../../context/ActivityContext';
import { MovieCard } from '../MovieCard/MovieCard';

export function PersonalizedRail({ onWatchTrailer }) {
  const { tasteProfile, topGenres, resetTasteProfile } = useActivity();
  const [movies, setMovies] = useState([]);
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -850 : 850;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await movieApi.getPersonalized({
        favoriteGenres: topGenres,
        viewedMovieIds: tasteProfile.viewedMovieIds,
        lastInteractedMovieId: tasteProfile.lastInteractedMovieId
      });

      if (res && res.movies) {
        setMovies(res.movies);
        setRationale(res.rationale || 'Curated for you based on your unique cinephile taste');
      }
    } catch (err) {
      console.warn('Personalized recommendations fetch skipped:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [tasteProfile.totalInteractions]);

  if (!loading && movies.length === 0) {
    return null;
  }

  return (
    <section className="relative p-6 sm:p-7 rounded-2xl glass-elevated border border-amber-accent/30 shadow-cinema-card overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-accent/10 rounded-full filter blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-accent/20 border border-amber-accent/40 text-[11px] font-bold text-amber-accent uppercase tracking-wider">
              <Film className="w-3 h-3 text-amber-accent" />
              <span>Curated For You</span>
            </span>

            {tasteProfile.totalInteractions > 0 ? (
              <span className="text-[11px] text-cinema-muted font-medium">
                Based on your viewing preferences
              </span>
            ) : (
              <span className="text-[11px] text-cinema-muted font-medium">
                Personalized picks based on your activity
              </span>
            )}
          </div>

          <h2 className="font-outfit text-2xl sm:text-3xl font-bold text-cinema-heading flex items-center gap-2">
            <span>Recommended For You</span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-accent/90 mt-0.5 font-medium">
            {rationale}
          </p>
        </div>

        {/* Action Buttons & Carousel Nav */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {tasteProfile.totalInteractions > 0 && (
            <button
              onClick={resetTasteProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-cinema-stroke text-[11px] font-medium text-cinema-muted hover:text-cinema-heading transition-colors mr-2"
              title="Reset preferences"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Preferences</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-cinema-stroke text-cinema-heading flex items-center justify-center transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-surface-2 hover:bg-surface-3 border border-cinema-stroke text-cinema-heading flex items-center justify-center transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Movie Cards Carousel Track (Netflix-style) */}
      {loading ? (
        <div className="flex gap-5 sm:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[220px] sm:w-[250px] md:w-[280px] lg:w-[300px] aspect-[2/3] rounded-2xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="flex-shrink-0 w-[220px] sm:w-[250px] md:w-[280px] lg:w-[300px] snap-start"
            >
              <MovieCard
                movie={movie}
                onWatchTrailer={onWatchTrailer}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
