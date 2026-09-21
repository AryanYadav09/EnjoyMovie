import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Play, Bookmark, ExternalLink, Clock, Calendar, Star, Film, MessageSquare, ChevronDown } from 'lucide-react';
import { movieApi } from '../services/api';
import { useWatchlist } from '../context/WatchlistContext';
import { useActivity } from '../context/ActivityContext';
import { RatingBadge, DualRatingDisplay } from '../components/RatingBadge/RatingBadge';
import { CastCard } from '../components/CastCard/CastCard';
import { ReviewCard } from '../components/ReviewCard/ReviewCard';
import { MovieCarousel } from '../components/MovieCarousel/MovieCarousel';
import { DetailsSkeleton } from '../components/Skeleton/Skeleton';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

const REVIEW_SORT_OPTIONS = [
  { value: 'highest', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'longest', label: 'Longest Reviews' }
];

export function MovieDetails({ onWatchTrailer }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { recordMovieView } = useActivity();

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('highest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await movieApi.getDetails(id);
      setMovie(data.movie);
      setRecommendations(data.recommendations || []);

      if (data.movie) {
        recordMovieView(data.movie);
      }

      // If URL had playTrailer query, trigger trailer
      if (searchParams.get('playTrailer') === 'true' && data.movie && onWatchTrailer) {
        onWatchTrailer(data.movie);
      }

      // Fetch reviews
      try {
        const reviewData = await movieApi.getReviews(id, 1, reviewSort);
        setReviews(reviewData.reviews || []);
      } catch (err) {
        console.warn('Reviews unavailable:', err.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Re-fetch sorted reviews when sort dropdown changes
  useEffect(() => {
    if (!id || loading) return;
    movieApi.getReviews(id, 1, reviewSort)
      .then(res => setReviews(res.reviews || []))
      .catch(e => console.warn('Could not sort reviews', e));
  }, [reviewSort]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <ErrorMessage
          title="Movie Details Unavailable"
          message={error || 'Could not find the requested movie record.'}
          onRetry={fetchDetails}
        />
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 4);

  return (
    <div className="min-h-screen pb-16">
      {/* 1. Cinematic Hero Section with Backdrop */}
      <section className="relative min-h-[500px] sm:min-h-[580px] flex items-end pb-12 overflow-hidden">
        {/* Dynamic Backdrop */}
        {movie.backdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 opacity-40 scale-105"
            style={{ backgroundImage: `url(${movie.backdrop})` }}
          />
        )}
        <div className="absolute inset-0 hero-overlay" />

        {/* Ambient Amber Glow */}
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-amber-accent/10 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Hero Meta Card Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            {/* High-res Poster */}
            <div className="w-48 sm:w-56 md:w-64 aspect-poster rounded-2xl overflow-hidden bg-surface-2 border-2 border-white/10 shadow-2xl flex-shrink-0">
              {movie.poster ? (
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-cinema-muted p-4">
                  <Film className="w-12 h-12 opacity-30 text-amber-accent mb-2" />
                  <span className="text-xs">{movie.title}</span>
                </div>
              )}
            </div>

            {/* Title & Specifications Stack */}
            <div className="flex-1 space-y-4">
              {/* Year, Runtime, Age Rating */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cinema-muted">
                {movie.year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{movie.year}</span>
                  </span>
                )}
                {movie.formattedRuntime && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{movie.formattedRuntime}</span>
                    </span>
                  </>
                )}
                {movie.rated && (
                  <>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/10 text-cinema-heading text-[10px] font-bold">
                      {movie.rated}
                    </span>
                  </>
                )}
              </div>

              {/* Movie Title */}
              <h1 className="font-outfit text-3xl sm:text-4xl md:text-5xl font-extrabold text-cinema-heading leading-tight">
                {movie.title}
              </h1>

              {/* Tagline */}
              {movie.tagline && (
                <p className="text-sm sm:text-base italic text-cinema-body/80 font-inter">
                  "{movie.tagline}"
                </p>
              )}

              {/* Genre Pills */}
              <div className="flex flex-wrap gap-1.5">
                {movie.genres?.map(genre => (
                  <Link
                    key={genre}
                    to={`/discover?genres=${encodeURIComponent(genre)}`}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-amber-accent hover:text-canvas border border-white/10 text-cinema-heading transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>

              {/* Ratings Display: IMDb, TMDB, Rotten Tomatoes, Metascore */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <DualRatingDisplay
                  imdbRating={movie.imdbRating}
                  imdbVotes={movie.imdbVotes}
                  tmdbRating={movie.tmdbRating}
                  tmdbVotes={movie.tmdbVotes}
                />

                {movie.rottenTomatoes && (
                  <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold font-outfit">
                    🍅 {movie.rottenTomatoes} RT
                  </div>
                )}

                {movie.metascore && (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-outfit">
                    Metascore {movie.metascore}
                  </div>
                )}

                {movie.qualityScore && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-accent/10 border border-amber-accent/30 text-amber-accent text-xs font-bold font-outfit" title="Bayesian-weighted quality score">
                    Quality Score {movie.qualityScore}
                  </div>
                )}
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onWatchTrailer && onWatchTrailer(movie)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-accent text-canvas text-sm font-bold hover:bg-amber-deep shadow-cinema-glow transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Watch Trailer</span>
                </button>

                <button
                  onClick={() => toggleWatchlist(movie)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                    inWatchlist
                      ? 'bg-white/15 text-amber-accent border-amber-accent shadow-cinema-glow'
                      : 'bg-surface-2 hover:bg-surface-3 text-cinema-heading border-cinema-stroke hover:border-white/20'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWatchlist ? 'fill-current' : ''}`} />
                  <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>

                {movie.imdbUrl && (
                  <a
                    href={movie.imdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-surface-2/80 hover:bg-surface-3 border border-cinema-stroke text-gold-cinema text-xs font-semibold transition-colors"
                  >
                    <span>IMDb Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {movie.tmdbUrl && (
                  <a
                    href={movie.tmdbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-surface-2/80 hover:bg-surface-3 border border-cinema-stroke text-cinema-muted hover:text-cinema-heading text-xs font-medium transition-colors"
                  >
                    <span>TMDB Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Overview & Crew Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Overview text */}
          <div className="lg:col-span-2 p-6 rounded-2xl glass-surface space-y-4">
            <h2 className="font-outfit text-xl font-bold text-cinema-heading">
              Overview
            </h2>
            <p className="text-sm sm:text-base text-cinema-body leading-relaxed whitespace-pre-line">
              {movie.overview || 'No synopsis provided for this title.'}
            </p>
          </div>

          {/* Director & Key Crew Panel */}
          <div className="p-6 rounded-2xl glass-surface space-y-4">
            <h2 className="font-outfit text-lg font-bold text-cinema-heading">
              Creative Crew
            </h2>

            {movie.director && (
              <div>
                <span className="text-xs uppercase font-semibold text-cinema-muted tracking-wider block">
                  Director
                </span>
                <span className="text-sm font-semibold text-cinema-heading mt-0.5 block">
                  {movie.director}
                </span>
              </div>
            )}

            {movie.writers?.length > 0 && (
              <div className="pt-2 border-t border-cinema-stroke">
                <span className="text-xs uppercase font-semibold text-cinema-muted tracking-wider block">
                  Writers
                </span>
                <span className="text-sm text-cinema-body mt-0.5 block">
                  {movie.writers.join(', ')}
                </span>
              </div>
            )}

            {movie.status && (
              <div className="pt-2 border-t border-cinema-stroke flex justify-between text-xs">
                <span className="text-cinema-muted">Status</span>
                <span className="text-cinema-heading font-medium">{movie.status}</span>
              </div>
            )}

            {movie.budget > 0 && (
              <div className="pt-2 border-t border-cinema-stroke flex justify-between text-xs">
                <span className="text-cinema-muted">Budget</span>
                <span className="text-cinema-heading font-medium">${movie.budget.toLocaleString()}</span>
              </div>
            )}

            {movie.revenue > 0 && (
              <div className="pt-2 border-t border-cinema-stroke flex justify-between text-xs">
                <span className="text-cinema-muted">Box Office</span>
                <span className="text-cinema-heading font-medium">${movie.revenue.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Cast Section */}
        {movie.cast?.length > 0 && (
          <section className="space-y-4">
            <h2 className="font-outfit text-xl sm:text-2xl font-bold text-cinema-heading">
              Featured Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {movie.cast.map(c => (
                <CastCard key={c.id} member={c} />
              ))}
            </div>
          </section>
        )}

        {/* 4. Dedicated Reviews Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cinema-stroke">
            <div>
              <h2 className="font-outfit text-xl sm:text-2xl font-bold text-cinema-heading flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-accent" />
                <span>Audience & Critic Reviews</span>
              </h2>
              <p className="text-xs text-cinema-muted mt-0.5">
                Authentic opinions from TMDB community cinephiles
              </p>
            </div>

            {/* Review Sorting Dropdown */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-cinema-muted">Sort Reviews:</span>
                <div className="relative">
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                    className="appearance-none bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-amber-accent cursor-pointer"
                  >
                    {REVIEW_SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-cinema-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="p-8 rounded-xl glass-surface text-center text-cinema-muted text-sm">
              No user reviews have been submitted for this title yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedReviews.map(r => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}

          {reviews.length > 4 && (
            <div className="text-center pt-2">
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="px-5 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 border border-cinema-stroke text-cinema-heading text-xs font-semibold transition-colors"
              >
                {showAllReviews ? 'Show Fewer Reviews' : `View All ${reviews.length} Reviews`}
              </button>
            </div>
          )}
        </section>

        {/* 5. You May Also Like Recommendations */}
        {recommendations.length > 0 && (
          <MovieCarousel
            title="You May Also Like"
            subtitle={`Curated recommendations based on ${movie.title}`}
            movies={recommendations}
            onWatchTrailer={onWatchTrailer}
          />
        )}
      </div>
    </div>
  );
}
