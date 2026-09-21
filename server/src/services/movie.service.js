import * as tmdbService from './tmdb.service.js';
import * as omdbService from './omdb.service.js';
import { normalizeMovieDetails, normalizeMovieCard } from '../utils/normalizer.js';

/**
 * Fetch full movie details with OMDb enrichment (IMDb rating, RT, Metascore)
 */
export async function getFullMovieDetails(id) {
  const tmdbDetails = await tmdbService.getMovieDetails(id);
  if (!tmdbDetails) return null;

  const imdbId = tmdbDetails.imdb_id || tmdbDetails.external_ids?.imdb_id;
  let omdbData = null;

  if (imdbId) {
    try {
      omdbData = await omdbService.getOmdbData(imdbId);
    } catch (err) {
      console.warn('OMDb enrichment skipped:', err.message);
    }
  }

  const normalized = normalizeMovieDetails(tmdbDetails, omdbData);

  // Parse recommendations if appended
  let recommendations = [];
  if (tmdbDetails.recommendations && Array.isArray(tmdbDetails.recommendations.results)) {
    const { genreMap } = await tmdbService.getGenres();
    recommendations = tmdbDetails.recommendations.results
      .slice(0, 12)
      .map(m => normalizeMovieCard(m, genreMap));
  } else if (tmdbDetails.similar && Array.isArray(tmdbDetails.similar.results)) {
    const { genreMap } = await tmdbService.getGenres();
    recommendations = tmdbDetails.similar.results
      .slice(0, 12)
      .map(m => normalizeMovieCard(m, genreMap));
  }

  return {
    movie: normalized,
    recommendations
  };
}

/**
 * Fetch reviews with sorting
 * Supported sorts: 'highest', 'newest', 'oldest', 'longest'
 */
export async function getSortedMovieReviews(id, page = 1, sort = 'newest') {
  const result = await tmdbService.getMovieReviews(id, page);
  let reviews = [...result.reviews];

  switch (sort) {
    case 'highest':
      reviews.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'oldest':
      reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'longest':
      reviews.sort((a, b) => b.content.length - a.content.length);
      break;
    default:
      break;
  }

  return {
    ...result,
    reviews
  };
}
