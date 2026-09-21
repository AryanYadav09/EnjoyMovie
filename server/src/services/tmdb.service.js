import axios from 'axios';
import { config } from '../config/env.js';
import { cache, TTL } from '../cache/cache.js';
import { normalizeMovieCard, normalizeMovieDetails, normalizeReviews } from '../utils/normalizer.js';

// Setup TMDB Axios client with Auth Headers
function getTmdbClient() {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (config.tmdb.accessToken) {
    headers['Authorization'] = `Bearer ${config.tmdb.accessToken}`;
  }

  return axios.create({
    baseURL: config.tmdb.baseUrl,
    headers,
    timeout: 10000,
    params: config.tmdb.accessToken ? {} : { api_key: config.tmdb.apiKey }
  });
}

/**
 * Fetch official TMDB movie genre list (cached for 24h)
 */
export async function getGenres() {
  const cacheKey = 'tmdb:genres';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    // Return standard TMDB genres if API keys are not yet configured
    const fallbackGenres = [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 16, name: 'Animation' },
      { id: 35, name: 'Comedy' },
      { id: 80, name: 'Crime' },
      { id: 99, name: 'Documentary' },
      { id: 18, name: 'Drama' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
      { id: 36, name: 'History' },
      { id: 27, name: 'Horror' },
      { id: 10402, name: 'Music' },
      { id: 9648, name: 'Mystery' },
      { id: 10749, name: 'Romance' },
      { id: 878, name: 'Science Fiction' },
      { id: 10770, name: 'TV Movie' },
      { id: 53, name: 'Thriller' },
      { id: 10752, name: 'War' },
      { id: 37, name: 'Western' }
    ];
    const genreMap = {};
    fallbackGenres.forEach(g => { genreMap[g.id] = g.name; });
    return { genres: fallbackGenres, genreMap };
  }

  try {
    const client = getTmdbClient();
    const res = await client.get('/genre/movie/list', {
      params: { language: 'en-US' }
    });

    const genres = res.data.genres || [];
    const genreMap = {};
    genres.forEach(g => { genreMap[g.id] = g.name; });

    const result = { genres, genreMap };
    cache.set(cacheKey, result, TTL.GENRES);
    return result;
  } catch (error) {
    console.error('TMDB getGenres error:', error.message);
    throw new Error('Failed to retrieve genres from TMDB');
  }
}

/**
 * Discover movies with advanced multi-parameter filtering
 */
export async function discoverMovies({
  genres = [], // IDs or names
  genreLogic = 'AND', // 'AND' (comma) or 'OR' (pipe)
  minRating = 0,
  maxRating = 10,
  minVotes = 100,
  fromYear,
  toYear,
  sort = 'vote_average.desc',
  page = 1,
  language = 'en-US',
  region
}) {
  const cacheKey = `tmdb:discover:${JSON.stringify({ genres, genreLogic, minRating, maxRating, minVotes, fromYear, toYear, sort, page, region })}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { genres: allGenres, genreMap } = await getGenres();

  // Helper to map aliases like Sci-Fi -> Science Fiction
  const normalizeGenre = (g) => {
    const s = String(g).toLowerCase().trim();
    if (s === 'sci-fi' || s === 'scifi' || s === 'sci fi') return 'science fiction';
    return s;
  };

  // If no TMDB key configured, provide interactive demo filtering
  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    const { DEMO_MOVIES } = await import('./demoCatalog.js');
    let filtered = [...DEMO_MOVIES];

    // Filter by genres
    if (Array.isArray(genres) && genres.length > 0) {
      const lowerGenres = genres.map(normalizeGenre);
      if (genreLogic.toUpperCase() === 'AND') {
        filtered = filtered.filter(m => 
          lowerGenres.every(g => m.genres.some(mg => normalizeGenre(mg) === g))
        );
      } else {
        filtered = filtered.filter(m => 
          lowerGenres.some(g => m.genres.some(mg => normalizeGenre(mg) === g))
        );
      }
    }

    // Filter by min rating
    if (minRating && Number(minRating) > 0) {
      filtered = filtered.filter(m => (m.imdbRating || m.tmdbRating || 0) >= Number(minRating));
    }

    // Filter by max rating
    if (maxRating && Number(maxRating) < 10) {
      filtered = filtered.filter(m => (m.imdbRating || m.tmdbRating || 0) <= Number(maxRating));
    }

    // Filter by years
    if (fromYear) {
      filtered = filtered.filter(m => m.year >= Number(fromYear));
    }
    if (toYear) {
      filtered = filtered.filter(m => m.year <= Number(toYear));
    }

    // Sort
    if (sort === 'rating' || sort === 'vote_average.desc') {
      filtered.sort((a, b) => (b.imdbRating || b.tmdbRating) - (a.imdbRating || a.tmdbRating));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => a.year - b.year);
    } else if (sort === 'votes') {
      filtered.sort((a, b) => (b.imdbVotes || b.tmdbVotes) - (a.imdbVotes || a.tmdbVotes));
    } else {
      filtered.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    }

    const result = {
      page: 1,
      totalPages: 1,
      totalResults: filtered.length,
      movies: filtered
    };
    cache.set(cacheKey, result, TTL.DISCOVER);
    return result;
  }

  // Map genre names to IDs if strings passed
  let genreIds = [];
  if (Array.isArray(genres) && genres.length > 0) {
    genreIds = genres.map(g => {
      if (typeof g === 'number' || !isNaN(Number(g))) return Number(g);
      const normalized = normalizeGenre(g);
      const match = allGenres.find(item => normalizeGenre(item.name) === normalized);
      return match ? match.id : null;
    }).filter(Boolean);
  }

  const separator = genreLogic.toUpperCase() === 'OR' ? '|' : ',';
  const with_genres = genreIds.length > 0 ? genreIds.join(separator) : undefined;

  // Map sort options to TMDB sort_by
  let sort_by = 'popularity.desc';
  switch (sort) {
    case 'rating':
    case 'vote_average.desc':
    case 'imdb':
      sort_by = 'vote_average.desc';
      break;
    case 'votes':
    case 'vote_count.desc':
      sort_by = 'vote_count.desc';
      break;
    case 'newest':
    case 'primary_release_date.desc':
      sort_by = 'primary_release_date.desc';
      break;
    case 'oldest':
    case 'primary_release_date.asc':
      sort_by = 'primary_release_date.asc';
      break;
    case 'popular':
    case 'popularity.desc':
      sort_by = 'popularity.desc';
      break;
    case 'revenue':
      sort_by = 'revenue.desc';
      break;
    default:
      sort_by = 'popularity.desc';
  }

  const params = {
    include_adult: false,
    include_video: false,
    language,
    page: Math.max(1, parseInt(page, 10) || 1),
    sort_by,
    'vote_count.gte': Math.max(10, parseInt(minVotes, 10) || 100)
  };

  if (with_genres) {
    params.with_genres = with_genres;
  }

  if (minRating && Number(minRating) > 0) {
    params['vote_average.gte'] = Number(minRating);
  }

  if (maxRating && Number(maxRating) < 10) {
    params['vote_average.lte'] = Number(maxRating);
  }

  if (fromYear) {
    params['primary_release_date.gte'] = `${fromYear}-01-01`;
  }

  if (toYear) {
    params['primary_release_date.lte'] = `${toYear}-12-31`;
  }

  if (region) {
    params.region = region;
  }

  const client = getTmdbClient();
  const res = await client.get('/discover/movie', { params });

  const rawResults = res.data.results || [];
  const movies = rawResults.map(m => normalizeMovieCard(m, genreMap));

  const result = {
    page: res.data.page,
    totalPages: res.data.total_pages,
    totalResults: res.data.total_results,
    movies
  };

  cache.set(cacheKey, result, TTL.DISCOVER);
  return result;
}

/**
 * Search movies by keyword or title
 */
export async function searchMovies(query, page = 1) {
  if (!query || !query.trim()) {
    return { page: 1, totalPages: 0, totalResults: 0, movies: [] };
  }

  const cleanQuery = query.trim();
  const cacheKey = `tmdb:search:${cleanQuery}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    const { DEMO_MOVIES } = await import('./demoCatalog.js');
    const lower = cleanQuery.toLowerCase();
    const matched = DEMO_MOVIES.filter(m => 
      m.title.toLowerCase().includes(lower) ||
      m.overview.toLowerCase().includes(lower) ||
      m.genres.some(g => g.toLowerCase().includes(lower)) ||
      (m.director && m.director.toLowerCase().includes(lower))
    );
    return {
      page: 1,
      totalPages: 1,
      totalResults: matched.length,
      movies: matched
    };
  }

  const { genreMap } = await getGenres();
  const client = getTmdbClient();

  const res = await client.get('/search/movie', {
    params: {
      query: cleanQuery,
      page: Math.max(1, parseInt(page, 10) || 1),
      include_adult: false
    }
  });

  const rawResults = res.data.results || [];
  const movies = rawResults.map(m => normalizeMovieCard(m, genreMap));

  const result = {
    page: res.data.page,
    totalPages: res.data.total_pages,
    totalResults: res.data.total_results,
    movies
  };

  cache.set(cacheKey, result, TTL.SEARCH);
  return result;
}

/**
 * Fetch detailed movie info appending credits, videos, external IDs, recommendations
 */
export async function getMovieDetails(id) {
  const cacheKey = `tmdb:movie:${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    const { DEMO_MOVIES } = await import('./demoCatalog.js');
    const numId = Number(id);
    const found = DEMO_MOVIES.find(m => m.id === numId) || DEMO_MOVIES[0];
    const recs = DEMO_MOVIES.filter(m => m.id !== found.id).slice(0, 8);
    return {
      ...found,
      credits: {
        cast: found.cast || [],
        crew: [{ job: 'Director', name: found.director }]
      },
      videos: {
        results: found.trailerKey ? [{ site: 'YouTube', type: 'Trailer', key: found.trailerKey }] : []
      },
      recommendations: {
        results: recs
      }
    };
  }

  const client = getTmdbClient();
  const res = await client.get(`/movie/${id}`, {
    params: {
      append_to_response: 'credits,videos,external_ids,recommendations,similar'
    }
  });

  cache.set(cacheKey, res.data, TTL.MOVIE_DETAILS);
  return res.data;
}

/**
 * Fetch reviews for a movie
 */
export async function getMovieReviews(id, page = 1) {
  const cacheKey = `tmdb:reviews:${id}:${page}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    const { DEMO_REVIEWS } = await import('./demoCatalog.js');
    return {
      page: 1,
      totalPages: 1,
      totalResults: DEMO_REVIEWS.length,
      reviews: DEMO_REVIEWS
    };
  }

  const client = getTmdbClient();
  const res = await client.get(`/movie/${id}/reviews`, {
    params: { page: Math.max(1, parseInt(page, 10) || 1) }
  });

  const reviews = normalizeReviews(res.data);
  const result = {
    page: res.data.page,
    totalPages: res.data.total_pages,
    totalResults: res.data.total_results,
    reviews
  };

  cache.set(cacheKey, result, TTL.REVIEWS);
  return result;
}

/**
 * Fetch weekly or daily trending movies
 */
export async function getTrending(timeWindow = 'week') {
  const cacheKey = `tmdb:trending:${timeWindow}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.tmdb.apiKey && !config.tmdb.accessToken) {
    const { DEMO_MOVIES } = await import('./demoCatalog.js');
    return { movies: DEMO_MOVIES.slice(0, 10) };
  }

  const { genreMap } = await getGenres();
  const client = getTmdbClient();

  const res = await client.get(`/trending/movie/${timeWindow}`);
  const rawResults = res.data.results || [];
  const movies = rawResults.map(m => normalizeMovieCard(m, genreMap));

  const result = { movies };
  cache.set(cacheKey, result, TTL.TRENDING);
  return result;
}

