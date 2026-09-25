import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, RefreshCw, ChevronDown } from 'lucide-react';
import { movieApi } from '../services/api';
import { FilterPanel } from '../components/FilterPanel/FilterPanel';
import { MovieGrid } from '../components/MovieGrid/MovieGrid';
import { GridSkeleton } from '../components/Skeleton/Skeleton';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

const SORT_OPTIONS = [
  { value: 'quality', label: 'Quality Score (Weighted)' },
  { value: 'rating', label: 'Highest IMDb Rating' },
  { value: 'vote_count.desc', label: 'Most Votes' },
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'newest', label: 'Newest Releases' },
  { value: 'oldest', label: 'Oldest Releases' }
];

export function Discover({ onWatchTrailer, onOpenApiKeyModal }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  useEffect(() => {
    movieApi.getConfigStatus()
      .then(res => setIsLiveConnected(Boolean(res.tmdbConfigured)))
      .catch(() => setIsLiveConnected(false));
  }, []);

  // Parse filters from URL query parameters
  const [filters, setFilters] = useState(() => {
    const genresParam = searchParams.get('genres');
    return {
      genres: genresParam ? genresParam.split(',').filter(Boolean) : [],
      genreLogic: searchParams.get('logic') || 'AND',
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : 0,
      minVotes: searchParams.get('minVotes') ? parseInt(searchParams.get('minVotes'), 10) : 100,
      fromYear: searchParams.get('from') ? parseInt(searchParams.get('from'), 10) : '',
      toYear: searchParams.get('to') ? parseInt(searchParams.get('to'), 10) : '',
      sort: searchParams.get('sort') || 'quality'
    };
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Sync state changes to URL search parameters
  const syncFiltersToUrl = useCallback((updatedFilters) => {
    const params = new URLSearchParams();
    if (updatedFilters.genres && updatedFilters.genres.length > 0) {
      params.set('genres', updatedFilters.genres.join(','));
    }
    if (updatedFilters.genreLogic && updatedFilters.genreLogic !== 'AND') {
      params.set('logic', updatedFilters.genreLogic);
    }
    if (updatedFilters.minRating && updatedFilters.minRating > 0) {
      params.set('minRating', updatedFilters.minRating.toString());
    }
    if (updatedFilters.minVotes && updatedFilters.minVotes !== 100) {
      params.set('minVotes', updatedFilters.minVotes.toString());
    }
    if (updatedFilters.fromYear) {
      params.set('from', updatedFilters.fromYear.toString());
    }
    if (updatedFilters.toYear) {
      params.set('to', updatedFilters.toYear.toString());
    }
    if (updatedFilters.sort && updatedFilters.sort !== 'quality') {
      params.set('sort', updatedFilters.sort);
    }

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch movies based on current filters and page
  const fetchMovies = useCallback(async (currentPage = 1, append = false) => {
    if (currentPage === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const res = await movieApi.discover({
        genres: filters.genres,
        genreLogic: filters.genreLogic,
        minRating: filters.minRating,
        minVotes: filters.minVotes,
        fromYear: filters.fromYear,
        toYear: filters.toYear,
        sort: filters.sort,
        page: currentPage
      });

      if (append) {
        setMovies(prev => [...prev, ...(res.movies || [])]);
      } else {
        setMovies(res.movies || []);
      }

      setTotalPages(res.totalPages || 1);
      setTotalResults(res.totalResults || 0);
      setPage(currentPage);
    } catch (err) {
      setError(err.message || 'Failed to retrieve movie catalog');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchMovies(1, false);
  }, [fetchMovies]);

  const handleFilterChange = (newValues) => {
    const updated = { ...filters, ...newValues };
    setFilters(updated);
    syncFiltersToUrl(updated);
  };

  const handleResetFilters = () => {
    const reset = {
      genres: [],
      genreLogic: 'AND',
      minRating: 0,
      minVotes: 100,
      fromYear: '',
      toYear: '',
      sort: 'quality'
    };
    setFilters(reset);
    syncFiltersToUrl(reset);
  };

  const removeGenre = (genreName) => {
    handleFilterChange({
      genres: filters.genres.filter(g => g !== genreName)
    });
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loadingMore) {
      fetchMovies(page + 1, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-outfit text-3xl font-bold text-cinema-heading">
            Movie Discovery Engine
          </h1>
          <p className="text-xs sm:text-sm text-cinema-muted mt-1">
            Browse through thousands of verified films matching your exact genre, rating, and era specifications.
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface-2 border border-cinema-stroke text-cinema-heading text-sm font-semibold hover:border-amber-accent"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-accent" />
          <span>Filters {filters.genres.length > 0 && `(${filters.genres.length})`}</span>
        </button>
      </div>



      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Column: Sticky Desktop Filter Panel */}
        <div className="hidden lg:block lg:col-span-1 sticky top-24">
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        </div>

        {/* Right Column: Active Chips, Sort Dropdown & Movie Grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Controls Bar */}
          <div className="p-4 rounded-xl glass-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Results Count & Active Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-outfit font-bold text-sm text-cinema-heading">
                {totalResults.toLocaleString()} Movies Found
              </span>

              {filters.genres.map(g => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-accent/15 border border-amber-accent/30 text-amber-accent text-xs font-medium"
                >
                  <span>{g}</span>
                  <button
                    onClick={() => removeGenre(g)}
                    className="hover:text-canvas hover:bg-amber-accent rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gold-cinema/15 border border-gold-cinema/30 text-gold-cinema text-xs font-bold font-outfit">
                  <span>★ {filters.minRating}+</span>
                  <button
                    onClick={() => handleFilterChange({ minRating: 0 })}
                    className="hover:text-canvas hover:bg-gold-cinema rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-cinema-muted whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange({ sort: e.target.value })}
                  className="appearance-none bg-surface-2 border border-cinema-stroke text-cinema-heading text-xs rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-amber-accent cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-cinema-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>



          {/* Error Callout */}
          {error && (
            <ErrorMessage
              message={error}
              onRetry={() => fetchMovies(1, false)}
            />
          )}

          {/* Initial Loading Skeletons */}
          {loading && <GridSkeleton count={12} />}

          {/* Results Grid */}
          {!loading && !error && (
            <>
              <MovieGrid
                movies={movies}
                onWatchTrailer={onWatchTrailer}
                emptyMessage="No movies matched your filter combination."
              />

              {/* Load More Pagination UX */}
              {page < totalPages && (
                <div className="flex justify-center pt-8 pb-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-cinema-stroke hover:border-amber-accent/50 text-cinema-heading text-sm font-semibold shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-amber-accent animate-spin" />
                        <span>Loading Next 20 Movies...</span>
                      </>
                    ) : (
                      <span>Load More Movies (Page {page + 1} of {totalPages})</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Sheet */}
      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs h-full bg-surface-1 border-l border-cinema-stroke p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cinema-stroke">
              <h3 className="font-outfit font-bold text-base text-cinema-heading">
                Adjust Filters
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-lg text-cinema-muted hover:text-cinema-heading"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />

            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-amber-accent text-canvas text-sm font-bold shadow-cinema-glow"
            >
              Show {totalResults.toLocaleString()} Movies
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
