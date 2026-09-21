import { discoverMovies, getGenres, getMovieDetails, getTrending } from './tmdb.service.js';
import { normalizeMovieCard } from '../utils/normalizer.js';

const MOOD_GENRE_MAP = {
  adrenaline: ['Action', 'Thriller'],
  'mind-bending': ['Mystery', 'Science Fiction'],
  'feel-good': ['Comedy', 'Family', 'Animation'],
  'dark-chilling': ['Horror', 'Thriller'],
  emotional: ['Drama', 'Romance'],
  escapist: ['Adventure', 'Fantasy']
};

const ERA_MAP = {
  classic: { from: 1950, to: 1989 },
  '90s': { from: 1990, to: 1999 },
  '2000s': { from: 2000, to: 2009 },
  modern: { from: 2010, to: 2020 },
  recent: { from: 2021, to: 2026 },
  any: { from: null, to: null }
};

/**
 * Handle "What Should I Watch?" questionnaire discovery
 */
export async function getQuizRecommendations({
  genre,
  mood,
  minRating = 7.0,
  era = 'any',
  runtimeLength = 'any'
}) {
  const genresToQuery = [];

  if (genre) {
    genresToQuery.push(genre);
  }

  if (mood && MOOD_GENRE_MAP[mood]) {
    MOOD_GENRE_MAP[mood].forEach(g => {
      if (!genresToQuery.includes(g)) genresToQuery.push(g);
    });
  }

  let fromYear = null;
  let toYear = null;
  if (era && ERA_MAP[era]) {
    fromYear = ERA_MAP[era].from;
    toYear = ERA_MAP[era].to;
  }

  // Runtime ranges
  let minRuntime = null;
  let maxRuntime = null;
  if (runtimeLength === 'under-90') {
    maxRuntime = 90;
  } else if (runtimeLength === '90-120') {
    minRuntime = 90;
    maxRuntime = 120;
  } else if (runtimeLength === '120-150') {
    minRuntime = 120;
    maxRuntime = 150;
  } else if (runtimeLength === '150-plus') {
    minRuntime = 150;
  }

  const results = await discoverMovies({
    genres: genresToQuery,
    genreLogic: 'OR',
    minRating: parseFloat(minRating) || 7.0,
    minVotes: 500,
    fromYear,
    toYear,
    sort: 'vote_average.desc',
    page: 1
  });

  // Client-side runtime filter fallback if runtime metadata is present
  let filteredMovies = results.movies;
  if (minRuntime || maxRuntime) {
    filteredMovies = filteredMovies.filter(m => {
      if (!m.runtime) return true; // keep if unknown
      if (minRuntime && m.runtime < minRuntime) return false;
      if (maxRuntime && m.runtime > maxRuntime) return false;
      return true;
    });
  }

  return {
    criteria: {
      genre,
      mood,
      minRating,
      era,
      runtimeLength,
      matchedGenres: genresToQuery
    },
    totalResults: filteredMovies.length,
    movies: filteredMovies.slice(0, 18)
  };
}

/**
 * Fetch predefined homepage discovery category rails
 */
export async function getCuratedCategory(categoryKey) {
  const currentYear = new Date().getFullYear();

  switch (categoryKey) {
    case 'highly-rated':
      return discoverMovies({
        minRating: 7.8,
        minVotes: 2500,
        sort: 'rating',
        page: 1
      });

    case 'horror':
      return discoverMovies({
        genres: ['Horror'],
        minRating: 6.8,
        minVotes: 800,
        sort: 'rating',
        page: 1
      });

    case 'mystery':
      return discoverMovies({
        genres: ['Mystery'],
        minRating: 7.0,
        minVotes: 800,
        sort: 'rating',
        page: 1
      });

    case 'scifi':
      return discoverMovies({
        genres: ['Science Fiction'],
        minRating: 7.2,
        minVotes: 1500,
        sort: 'rating',
        page: 1
      });

    case 'action-adventure':
      return discoverMovies({
        genres: ['Action', 'Adventure'],
        genreLogic: 'AND',
        minRating: 7.0,
        minVotes: 2000,
        sort: 'rating',
        page: 1
      });

    case 'drama':
      return discoverMovies({
        genres: ['Drama'],
        minRating: 7.6,
        minVotes: 1200,
        sort: 'rating',
        page: 1
      });

    case 'comedy':
      return discoverMovies({
        genres: ['Comedy'],
        minRating: 7.0,
        minVotes: 1000,
        sort: 'rating',
        page: 1
      });

    case 'horror-thriller':
      return discoverMovies({
        genres: ['Horror', 'Thriller'],
        genreLogic: 'AND',
        minRating: 7.0,
        minVotes: 1000,
        sort: 'rating',
        page: 1
      });

    case 'recent':
      return discoverMovies({
        fromYear: currentYear - 1,
        toYear: currentYear,
        minVotes: 200,
        sort: 'newest',
        page: 1
      });

    case 'all-time':
      return discoverMovies({
        minRating: 8.2,
        minVotes: 6000,
        sort: 'rating',
        page: 1
      });

    default:
      return discoverMovies({ sort: 'popular', page: 1 });
  }
}

/**
 * Smart AI Recommendation Engine based on user activity (clicks, views, searches, watchlist)
 */
export async function recommendPersonalizedMovies({
  favoriteGenres = [],
  viewedMovieIds = [],
  preferredEras = [],
  lastInteractedMovieId = null
}) {
  // Normalize favoriteGenres to array of objects { genre, weight }
  let genreWeights = [];
  if (Array.isArray(favoriteGenres)) {
    genreWeights = favoriteGenres.map(g => {
      if (typeof g === 'string') return { genre: g, weight: 1 };
      return { genre: g.genre || g.name, weight: Number(g.weight) || 1 };
    }).sort((a, b) => b.weight - a.weight);
  }

  const topGenres = genreWeights.slice(0, 3).map(g => g.genre).filter(Boolean);
  const viewedSet = new Set((viewedMovieIds || []).map(Number));

  let candidatePool = [];

  // 1. If user recently interacted with a movie, fetch its direct recommendations
  if (lastInteractedMovieId) {
    try {
      const details = await getMovieDetails(lastInteractedMovieId);
      if (details && details.recommendations && Array.isArray(details.recommendations.results)) {
        const { genreMap } = await getGenres();
        const recs = details.recommendations.results.map(m => normalizeMovieCard(m, genreMap));
        candidatePool.push(...recs);
      }
    } catch (err) {
      console.warn('Personalized anchor recommendations skipped:', err.message);
    }
  }

  // 2. Discover films matching top favorite genres
  if (topGenres.length > 0) {
    const discoverResults = await discoverMovies({
      genres: topGenres,
      genreLogic: 'OR',
      minRating: 7.0,
      minVotes: 500,
      sort: 'rating',
      page: 1
    });
    if (discoverResults && Array.isArray(discoverResults.movies)) {
      candidatePool.push(...discoverResults.movies);
    }
  }

  // 3. If pool is sparse, supplement with highly-rated trending films
  if (candidatePool.length < 15) {
    const trending = await getTrending('week');
    if (trending && Array.isArray(trending.movies)) {
      candidatePool.push(...trending.movies);
    }
  }

  // Deduplicate and filter out already viewed movies
  const seenIds = new Set();
  const filteredCandidates = [];
  for (const movie of candidatePool) {
    if (!movie || !movie.id) continue;
    if (viewedSet.has(Number(movie.id))) continue;
    if (seenIds.has(Number(movie.id))) continue;
    seenIds.add(Number(movie.id));
    filteredCandidates.push(movie);
  }

  // Score candidates with AI Affinity Formula
  const scored = filteredCandidates.map(movie => {
    let genreScore = 0;
    if (Array.isArray(movie.genres)) {
      for (const g of movie.genres) {
        const match = genreWeights.find(gw => gw.genre.toLowerCase() === g.toLowerCase());
        if (match) {
          genreScore += match.weight;
        }
      }
    }

    // Era bonus
    let eraScore = 0;
    if (preferredEras.length > 0 && movie.year) {
      const movieDecade = `${Math.floor(movie.year / 10) * 10}s`;
      if (preferredEras.includes(movieDecade) || preferredEras.includes(String(movie.year))) {
        eraScore = 2;
      }
    }

    const quality = movie.qualityScore || 7.0;
    const finalScore = (quality * 0.45) + (Math.min(genreScore, 10) * 0.35) + (eraScore * 0.1) + (Math.min(movie.popularity || 0, 100) / 100 * 0.1);

    return {
      movie,
      affinityScore: Number(finalScore.toFixed(2))
    };
  });

  scored.sort((a, b) => b.affinityScore - a.affinityScore);

  // Generate personalized rationale
  let rationale = 'Curated cinephile gems';
  if (topGenres.length > 0) {
    rationale = `Curated for you based on your interest in ${topGenres.slice(0, 2).join(' & ')}`;
  } else if (candidatePool.length > 0) {
    rationale = 'Trending masterpieces dynamically personalized to your browsing taste';
  }

  return {
    rationale,
    topGenres,
    totalRecommendations: scored.length,
    movies: scored.slice(0, 18).map(s => s.movie)
  };
}
