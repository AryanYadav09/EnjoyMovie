import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, X, CheckCheck, SlidersHorizontal } from 'lucide-react';
import { movieApi } from '../services/api';
import { useActivity } from '../context/ActivityContext';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { MovieGrid } from '../components/MovieGrid/MovieGrid';
import { GridSkeleton } from '../components/Skeleton/Skeleton';
import { ErrorMessage } from '../components/ErrorMessage/ErrorMessage';

export function Search({ onWatchTrailer }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const isNlp = searchParams.get('nlp') !== 'false';
  const { recordSearch } = useActivity();

  const [movies, setMovies] = useState([]);
  const [parsedFilters, setParsedFilters] = useState(null);
  const [searchMeta, setSearchMeta] = useState({
    isAutoCorrected: false,
    didYouMean: null,
    usedQuery: '',
    originalQuery: ''
  });
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeSearch = async () => {
    if (!rawQuery.trim()) {
      setMovies([]);
      setParsedFilters(null);
      setSearchMeta({ isAutoCorrected: false, didYouMean: null, usedQuery: '', originalQuery: '' });
      setTotalResults(0);
      return;
    }

    recordSearch(rawQuery);
    setLoading(true);
    setError(null);

    try {
      if (isNlp) {
        const res = await movieApi.nlpSearch(rawQuery);
        setMovies(res.movies || []);
        setParsedFilters(res.parsedFilters || null);
        setSearchMeta({
          isAutoCorrected: Boolean(res.isAutoCorrected),
          didYouMean: res.didYouMean || null,
          usedQuery: res.usedQuery || rawQuery,
          originalQuery: res.originalQuery || rawQuery
        });
        setTotalResults(res.totalResults || res.movies?.length || 0);
      } else {
        const res = await movieApi.search(rawQuery);
        setMovies(res.movies || []);
        setParsedFilters(null);
        setSearchMeta({
          isAutoCorrected: Boolean(res.isAutoCorrected),
          didYouMean: res.didYouMean || null,
          usedQuery: res.usedQuery || rawQuery,
          originalQuery: res.originalQuery || rawQuery
        });
        setTotalResults(res.totalResults || res.movies?.length || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to search movie catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [rawQuery, isNlp]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Bar */}
      <div className="max-w-3xl mx-auto space-y-4 text-center">
        <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-cinema-heading">
          Movie Search & Discovery
        </h1>
        <p className="text-xs sm:text-sm text-cinema-muted">
          Type standard titles or describe what you want: <span className="text-amber-accent">"best horror movies after 2010"</span>, <span className="text-cyan-vivid">"ratings above 8"</span>.
        </p>
        <SearchBar initialValue={rawQuery} isNlpDefault={isNlp} />
      </div>

      {/* Interpreted Filter Chips */}
      {parsedFilters && (parsedFilters.genres?.length > 0 || parsedFilters.minRating || parsedFilters.fromYear) && (
        <div className="p-4 rounded-xl glass-surface border border-amber-accent/30 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-amber-accent" />
            <span className="text-xs font-semibold text-cinema-heading">Active Filters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {parsedFilters.genres?.map(g => (
              <span key={g} className="px-2.5 py-0.5 rounded-full bg-amber-accent/20 text-amber-accent text-xs font-medium">
                {g}
              </span>
            ))}
            {parsedFilters.minRating && (
              <span className="px-2.5 py-0.5 rounded-full bg-gold-cinema/20 text-gold-cinema text-xs font-bold font-outfit">
                ★ {parsedFilters.minRating}+ Rating
              </span>
            )}
            {parsedFilters.fromYear && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-cinema-heading text-xs">
                Since {parsedFilters.fromYear}
              </span>
            )}
            {parsedFilters.toYear && (
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-cinema-heading text-xs">
                Until {parsedFilters.toYear}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Typo Auto-Correction Banner */}
      {searchMeta.isAutoCorrected && (
        <div className="p-4 rounded-xl bg-amber-accent/15 border border-amber-accent/40 max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs text-amber-accent shadow-cinema-glow">
          <div className="flex items-center gap-2.5">
            <SearchIcon className="w-4 h-4 text-amber-accent flex-shrink-0" />
            <span>
              Showing results for <strong className="text-cinema-heading font-bold text-sm">{searchMeta.didYouMean || searchMeta.usedQuery}</strong> (auto-corrected from <em>"{searchMeta.originalQuery}"</em>)
            </span>
          </div>
        </div>
      )}

      {/* "Did You Mean" Suggestion Chip (when not auto-corrected) */}
      {!searchMeta.isAutoCorrected && searchMeta.didYouMean && searchMeta.didYouMean.toLowerCase() !== rawQuery.toLowerCase() && (
        <div className="p-3.5 rounded-xl bg-surface-2 border border-cinema-stroke max-w-4xl mx-auto flex items-center gap-2.5 text-xs text-cinema-body">
          <SearchIcon className="w-4 h-4 text-cyan-vivid flex-shrink-0" />
          <span>Did you mean:</span>
          <Link
            to={`/search?q=${encodeURIComponent(searchMeta.didYouMean)}&nlp=false`}
            className="text-cyan-vivid font-bold hover:underline"
          >
            {searchMeta.didYouMean}
          </Link>
        </div>
      )}

      {/* Results Header */}
      {rawQuery && (
        <div className="flex items-center justify-between pb-3 border-b border-cinema-stroke">
          <span className="font-outfit font-semibold text-sm text-cinema-heading">
            {totalResults.toLocaleString()} Results for "{searchMeta.isAutoCorrected ? (searchMeta.didYouMean || searchMeta.usedQuery) : rawQuery}"
          </span>
        </div>
      )}

      {/* Error Callout */}
      {error && <ErrorMessage message={error} onRetry={executeSearch} />}

      {/* Loading Skeletons */}
      {loading && <GridSkeleton count={12} />}

      {/* Movie Results Grid */}
      {!loading && !error && (
        <MovieGrid
          movies={movies}
          onWatchTrailer={onWatchTrailer}
          emptyMessage={rawQuery ? `No movies found matching "${rawQuery}"` : 'Enter a query in the search bar above to begin.'}
        />
      )}
    </div>
  );
}
