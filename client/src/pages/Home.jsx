import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Compass, Flame, Film, ArrowRight, Key } from 'lucide-react';
import { movieApi } from '../services/api';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { MovieCarousel } from '../components/MovieCarousel/MovieCarousel';
import { MovieGrid } from '../components/MovieGrid/MovieGrid';
import { PersonalizedRail } from '../components/PersonalizedRail/PersonalizedRail';
import { GridSkeleton } from '../components/Skeleton/Skeleton';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

const QUICK_GENRES = [
  { name: 'Horror', emoji: '👻', path: '/discover?genres=Horror&minRating=6.8' },
  { name: 'Mystery', emoji: '🕵️', path: '/discover?genres=Mystery&minRating=7.0' },
  { name: 'Sci-Fi', emoji: '🚀', path: '/discover?genres=Science Fiction&minRating=7.0' },
  { name: 'Thriller', emoji: '🩸', path: '/discover?genres=Thriller&minRating=7.0' },
  { name: 'Action', emoji: '⚔️', path: '/discover?genres=Action&minRating=7.0' },
  { name: 'Drama', emoji: '🎭', path: '/discover?genres=Drama&minRating=7.5' },
  { name: 'Comedy', emoji: '😂', path: '/discover?genres=Comedy&minRating=7.0' },
  { name: 'Romance', emoji: '❤️', path: '/discover?genres=Romance&minRating=7.0' },
  { name: 'Crime', emoji: '💼', path: '/discover?genres=Crime&minRating=7.2' }
];

export function Home({ onOpenQuiz, onOpenApiKeyModal, onWatchTrailer }) {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [highlyRated, setHighlyRated] = useState([]);
  const [horrorMystery, setHorrorMystery] = useState([]);
  const [sciFi, setSciFi] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    movieApi.getConfigStatus()
      .then(res => setIsLiveConnected(Boolean(res.tmdbConfigured)))
      .catch(() => setIsLiveConnected(false));
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendRes, highRes, hmRes, scifiRes, recRes] = await Promise.all([
        movieApi.getTrending('week').catch(() => ({ movies: [] })),
        movieApi.getCurated('highly-rated').catch(() => ({ movies: [] })),
        movieApi.getCurated('horror-thriller').catch(() => ({ movies: [] })),
        movieApi.getCurated('scifi').catch(() => ({ movies: [] })),
        movieApi.getCurated('recent').catch(() => ({ movies: [] }))
      ]);

      setTrending(trendRes.movies || []);
      setHighlyRated(highRes.movies || []);
      setHorrorMystery(hmRes.movies || []);
      setSciFi(scifiRes.movies || []);
      setRecent(recRes.movies || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to movie discovery services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  const heroBackdrop = trending[0]?.backdrop || highlyRated[0]?.backdrop;

  return (
    <div className="min-h-screen">
      {/* 1. Cinematic Hero Section */}
      <section className="relative min-h-[520px] sm:min-h-[580px] flex items-center justify-center overflow-hidden">
        {/* Dynamic Backdrop */}
        {heroBackdrop && (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105 filter blur-[1px] opacity-35"
            style={{ backgroundImage: `url(${heroBackdrop})` }}
          />
        )}
        <div className="absolute inset-0 hero-overlay" />

        {/* Ambient Top Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-accent/15 rounded-full filter blur-[100px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center py-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2/80 border border-cinema-stroke text-amber-accent text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>AI-Powered Cinephile Engine</span>
          </div>

          <h1 className="font-outfit text-4xl sm:text-5xl md:text-6xl font-extrabold text-cinema-heading leading-tight tracking-tight mb-4">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-accent via-amber-deep to-gold-cinema">Great Movie</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-cinema-muted max-w-2xl mx-auto leading-relaxed mb-8 font-inter">
            Discover highly rated movies without spending hours searching IMDb, review blogs, and release dates. Genuine scores, verified metrics, instant trailers.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-accent text-canvas text-sm font-bold hover:bg-amber-deep shadow-cinema-glow transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Discover Filters</span>
            </Link>

            <button
              onClick={onOpenQuiz}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2/90 hover:bg-surface-3 border border-cinema-stroke text-cinema-heading text-sm font-semibold transition-all backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-accent" />
              <span>What Should I Watch?</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 space-y-8">
        {/* Offline Curated Mode Notice Banner */}
        {!isLiveConnected && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-surface-2 to-surface-3 border border-amber-accent/30 shadow-cinema-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-accent/20 border border-amber-accent/40 flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-amber-accent" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-sm text-cinema-heading flex items-center gap-2">
                  <span>Currently Browsing Offline Curated Collection (55 Iconic Films)</span>
                </h3>
                <p className="text-xs text-cinema-muted mt-0.5">
                  Want live access to over 800,000+ movies, daily box office charts, and live actor filmographies? Connect your free TMDB API key in 1-click.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenApiKeyModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-accent text-canvas text-xs font-bold hover:bg-amber-deep shadow-cinema-glow transition-all whitespace-nowrap"
            >
              <span>Connect Free TMDB Key</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* 2. Quick Genre Chips */}
        <section className="p-4 rounded-2xl glass-surface overflow-x-auto scrollbar-none">
          <div className="flex items-center justify-between gap-2 min-w-max">
            <span className="text-xs font-bold uppercase tracking-wider text-cinema-muted mr-2">
              Popular Moods:
            </span>
            {QUICK_GENRES.map((g) => (
              <Link
                key={g.name}
                to={g.path}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 hover:bg-amber-accent hover:text-canvas border border-cinema-stroke text-cinema-body text-xs font-medium transition-all group"
              >
                <span>{g.emoji}</span>
                <span>{g.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. AI Personalized Recommendations Rail */}
        <PersonalizedRail onWatchTrailer={onWatchTrailer} />

        {/* Error Callout if applicable */}
        {error && (
          <ErrorMessage
            title="Discovery Feed Offline"
            message={error}
            onRetry={fetchHomeData}
          />
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-12 py-8">
            <GridSkeleton count={6} />
            <GridSkeleton count={6} />
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 3. Trending This Week Carousel */}
            {trending.length > 0 && (
              <MovieCarousel
                title="🔥 Trending This Week"
                subtitle="Most popular cinematic releases gaining momentum globally"
                movies={trending}
                viewAllLink="/discover?sort=popular"
                onWatchTrailer={onWatchTrailer}
              />
            )}

            {/* 4. Highly Rated Masterpieces Grid */}
            {highlyRated.length > 0 && (
              <section className="py-6">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="font-outfit text-xl sm:text-2xl font-bold text-cinema-heading flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-accent" />
                      <span>Highly Rated Cinema</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-cinema-muted mt-0.5">
                      Exceptional movies with verified ratings above 7.8 and strong vote counts
                    </p>
                  </div>
                  <Link
                    to="/discover?sort=rating&minRating=7.8&minVotes=2000"
                    className="text-xs sm:text-sm font-semibold text-amber-accent hover:text-amber-deep flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <MovieGrid
                  movies={highlyRated.slice(0, 12)}
                  onWatchTrailer={onWatchTrailer}
                />
              </section>
            )}

            {/* 5. Best Horror & Thriller Carousel */}
            {horrorMystery.length > 0 && (
              <MovieCarousel
                title="🩸 Best Horror & Thriller"
                subtitle="Chilling suspense, atmospheric dread, and high-tension storytelling"
                movies={horrorMystery}
                viewAllLink="/discover?genres=Horror,Thriller&genreLogic=AND&minRating=7.0"
                onWatchTrailer={onWatchTrailer}
              />
            )}

            {/* 6. Mind-Bending Science Fiction */}
            {sciFi.length > 0 && (
              <MovieCarousel
                title="🚀 Best Science Fiction"
                subtitle="Futuristic visions, space odysseys, and thought-provoking concepts"
                movies={sciFi}
                viewAllLink="/discover?genres=Science Fiction&minRating=7.2"
                onWatchTrailer={onWatchTrailer}
              />
            )}

            {/* 7. Recently Released Cinema */}
            {recent.length > 0 && (
              <MovieCarousel
                title="🆕 Recently Released"
                subtitle="Fresh additions from current cinema seasons"
                movies={recent}
                viewAllLink="/discover?sort=newest"
                onWatchTrailer={onWatchTrailer}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
