import { calculateQualityScore, formatVoteCount } from './qualityScore.js';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Format minutes into "2h 18m"
 */
export function formatRuntime(minutes) {
  if (!minutes || isNaN(minutes)) return null;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

/**
 * Normalize a TMDB movie card object (from discover/search/popular)
 */
export function normalizeMovieCard(rawMovie, genreMap = {}) {
  if (!rawMovie) return null;

  // Resolve genre names
  let genres = [];
  if (Array.isArray(rawMovie.genres)) {
    genres = rawMovie.genres.map(g => (typeof g === 'string' ? g : g.name));
  } else if (Array.isArray(rawMovie.genre_ids)) {
    genres = rawMovie.genre_ids.map(id => genreMap[id]).filter(Boolean);
  }

  const releaseDate = rawMovie.release_date || rawMovie.releaseDate || rawMovie.first_air_date || '';
  const year = rawMovie.year || (releaseDate ? new Date(releaseDate).getFullYear() : null);

  const tmdbRating = rawMovie.vote_average !== undefined && rawMovie.vote_average !== null
    ? Number(rawMovie.vote_average.toFixed ? rawMovie.vote_average.toFixed(1) : rawMovie.vote_average)
    : (rawMovie.tmdbRating !== undefined ? rawMovie.tmdbRating : 0);
  const tmdbVotes = rawMovie.vote_count !== undefined && rawMovie.vote_count !== null
    ? rawMovie.vote_count
    : (rawMovie.tmdbVotes || 0);

  const poster = rawMovie.poster
    ? rawMovie.poster
    : (rawMovie.poster_path ? `${TMDB_IMAGE_BASE}/w500${rawMovie.poster_path}` : null);
  const backdrop = rawMovie.backdrop
    ? rawMovie.backdrop
    : (rawMovie.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${rawMovie.backdrop_path}` : null);

  const imdbRating = rawMovie.imdbRating !== undefined ? rawMovie.imdbRating : null;
  const imdbVotes = rawMovie.imdbVotes !== undefined ? rawMovie.imdbVotes : null;

  // Initial quality score
  const qualityScore = rawMovie.qualityScore || calculateQualityScore({
    imdbRating,
    tmdbRating,
    imdbVotes,
    tmdbVotes,
    popularity: rawMovie.popularity || 0,
    releaseDate
  });

  return {
    id: rawMovie.id,
    title: rawMovie.title || rawMovie.name || 'Untitled',
    originalTitle: rawMovie.original_title || rawMovie.title,
    releaseDate,
    year: !isNaN(year) ? year : null,
    poster,
    backdrop,
    overview: rawMovie.overview || '',
    genres,
    genreIds: rawMovie.genre_ids || rawMovie.genreIds || [],
    popularity: rawMovie.popularity || 0,
    tmdbRating,
    tmdbVotes,
    formattedTmdbVotes: formatVoteCount(tmdbVotes),
    imdbId: rawMovie.imdb_id || rawMovie.imdbId || null,
    imdbRating,
    imdbVotes,
    formattedImdbVotes: imdbVotes ? formatVoteCount(imdbVotes) : (rawMovie.formattedImdbVotes || null),
    qualityScore,
    runtime: rawMovie.runtime || null,
    formattedRuntime: rawMovie.formattedRuntime || formatRuntime(rawMovie.runtime)
  };
}

/**
 * Normalize full TMDB movie detail response (including appended credits, videos, etc.)
 */
export function normalizeMovieDetails(rawDetails, omdbData = null) {
  if (!rawDetails) return null;

  const base = normalizeMovieCard(rawDetails);

  // Parse director, cast, and crew from credits
  let director = rawDetails.director || null;
  let cast = rawDetails.cast && rawDetails.cast.length > 0 ? rawDetails.cast : [];
  let writers = rawDetails.writers || [];

  if (rawDetails.credits) {
    if (Array.isArray(rawDetails.credits.crew)) {
      const dir = rawDetails.credits.crew.find(c => c.job === 'Director');
      if (dir) director = dir.name;

      writers = rawDetails.credits.crew
        .filter(c => ['Screenplay', 'Writer', 'Story'].includes(c.job))
        .map(c => c.name)
        .slice(0, 3);
    }

    if (Array.isArray(rawDetails.credits.cast) && rawDetails.credits.cast.length > 0) {
      cast = rawDetails.credits.cast.slice(0, 15).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        avatar: c.profile_path ? `${TMDB_IMAGE_BASE}/w185${c.profile_path}` : (c.avatar || null)
      }));
    }
  }

  // Find best YouTube trailer
  let trailerKey = rawDetails.trailerKey || null;
  let trailerUrl = rawDetails.trailerUrl || (trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null);

  if (rawDetails.videos && Array.isArray(rawDetails.videos.results)) {
    const trailer = rawDetails.videos.results.find(
      v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
    ) || rawDetails.videos.results.find(v => v.site === 'YouTube');

    if (trailer) {
      trailerKey = trailer.key;
      trailerUrl = `https://www.youtube.com/watch?v=${trailer.key}`;
    }
  }

  // Extract IMDb ID from TMDB external_ids or direct field
  const imdbId = rawDetails.imdb_id || rawDetails.imdbId || rawDetails.external_ids?.imdb_id || null;

  // Extract OMDb enrichment fields
  let imdbRating = rawDetails.imdbRating !== undefined ? rawDetails.imdbRating : null;
  let imdbVotes = rawDetails.imdbVotes !== undefined ? rawDetails.imdbVotes : null;
  let rottenTomatoes = rawDetails.rottenTomatoes || null;
  let metascore = rawDetails.metascore || null;
  let rated = rawDetails.rated || null;

  if (omdbData && omdbData.Response !== 'False') {
    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
      imdbRating = parseFloat(omdbData.imdbRating);
    }
    if (omdbData.imdbVotes && omdbData.imdbVotes !== 'N/A') {
      imdbVotes = parseInt(omdbData.imdbVotes.replace(/,/g, ''), 10);
    }
    if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
      metascore = omdbData.Metascore;
    }
    if (omdbData.Rated && omdbData.Rated !== 'N/A') {
      rated = omdbData.Rated;
    }
    if (Array.isArray(omdbData.Ratings)) {
      const rt = omdbData.Ratings.find(r => r.Source === 'Rotten Tomatoes');
      if (rt) rottenTomatoes = rt.Value;
    }
  }

  // Recalculate quality score with enriched IMDb data
  const qualityScore = rawDetails.qualityScore || calculateQualityScore({
    imdbRating,
    tmdbRating: base.tmdbRating,
    imdbVotes,
    tmdbVotes: base.tmdbVotes,
    popularity: base.popularity,
    releaseDate: base.releaseDate
  });

  return {
    ...base,
    imdbId,
    imdbRating: imdbRating !== null ? Number(Number(imdbRating).toFixed(1)) : null,
    imdbVotes: imdbVotes || null,
    formattedImdbVotes: imdbVotes ? formatVoteCount(imdbVotes) : (rawDetails.formattedImdbVotes || null),
    rottenTomatoes,
    metascore,
    rated,
    qualityScore,
    runtime: rawDetails.runtime || null,
    formattedRuntime: rawDetails.formattedRuntime || formatRuntime(rawDetails.runtime),
    tagline: rawDetails.tagline || '',
    status: rawDetails.status || '',
    budget: rawDetails.budget || 0,
    revenue: rawDetails.revenue || 0,
    director,
    writers,
    cast,
    trailerKey,
    trailerUrl,
    imdbUrl: imdbId ? `https://www.imdb.com/title/${imdbId}/` : null,
    tmdbUrl: `https://www.themoviedb.org/movie/${rawDetails.id}`
  };
}

/**
 * Normalize TMDB reviews
 */
export function normalizeReviews(rawReviews) {
  if (!rawReviews || !Array.isArray(rawReviews.results)) return [];

  return rawReviews.results.map(r => {
    let avatar = null;
    const path = r.author_details?.avatar_path;
    if (path) {
      if (path.startsWith('/http://') || path.startsWith('/https://')) {
        avatar = path.substring(1);
      } else {
        avatar = `${TMDB_IMAGE_BASE}/w185${path}`;
      }
    }

    return {
      id: r.id,
      author: r.author || 'Anonymous Cinephile',
      avatar,
      rating: r.author_details?.rating || null,
      content: r.content || '',
      createdAt: r.created_at || '',
      url: r.url || ''
    };
  });
}
