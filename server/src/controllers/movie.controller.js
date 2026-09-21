import * as tmdbService from '../services/tmdb.service.js';
import * as movieService from '../services/movie.service.js';
import * as recommendationService from '../services/recommendation.service.js';
import { parseNaturalLanguageQuery } from '../services/nlp.service.js';
import { findClosestMatch, formatDisplayTitle } from '../services/fuzzySearch.service.js';

export async function discover(req, res, next) {
  try {
    const {
      genres,
      genreLogic = 'AND',
      minRating,
      maxRating,
      minVotes,
      fromYear,
      toYear,
      sort,
      page = 1,
      language = 'en-US',
      region
    } = req.query;

    // Parse genres: comma separated string or array
    let parsedGenres = [];
    if (typeof genres === 'string' && genres.trim()) {
      parsedGenres = genres.split(',').map(s => s.trim());
    } else if (Array.isArray(genres)) {
      parsedGenres = genres;
    }

    const data = await tmdbService.discoverMovies({
      genres: parsedGenres,
      genreLogic,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRating: maxRating ? parseFloat(maxRating) : undefined,
      minVotes: minVotes ? parseInt(minVotes, 10) : undefined,
      fromYear: fromYear ? parseInt(fromYear, 10) : undefined,
      toYear: toYear ? parseInt(toYear, 10) : undefined,
      sort,
      page: parseInt(page, 10) || 1,
      language,
      region
    });

    // If sorting by qualityScore specifically
    if (sort === 'quality' && Array.isArray(data.movies)) {
      data.movies.sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
    }

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function search(req, res, next) {
  try {
    const { query, page = 1 } = req.query;
    if (!query || !query.trim()) {
      return res.json({
        success: true,
        page: 1,
        totalPages: 0,
        totalResults: 0,
        movies: []
      });
    }

    const cleanQuery = query.trim();
    const fuzzy = findClosestMatch(cleanQuery);

    // 1. First run query as requested
    let data = await tmdbService.searchMovies(cleanQuery, parseInt(page, 10) || 1);
    let isAutoCorrected = false;
    let didYouMean = null;
    let usedQuery = cleanQuery;

    // 2. If 0 results or very sparse results, check if a strong fuzzy correction exists
    if ((!data.movies || data.movies.length === 0) && fuzzy && fuzzy.corrected.toLowerCase() !== cleanQuery.toLowerCase()) {
      const correctedData = await tmdbService.searchMovies(fuzzy.corrected, parseInt(page, 10) || 1);
      if (correctedData.movies && correctedData.movies.length > 0) {
        data = correctedData;
        isAutoCorrected = true;
        didYouMean = formatDisplayTitle(fuzzy.corrected);
        usedQuery = fuzzy.corrected;
      }
    } else if (fuzzy && fuzzy.distance > 0 && fuzzy.corrected.toLowerCase() !== cleanQuery.toLowerCase()) {
      // Results were found, but offer helpful "Did you mean: Interstellar?"
      didYouMean = formatDisplayTitle(fuzzy.corrected);
    }

    res.json({
      success: true,
      originalQuery: cleanQuery,
      usedQuery,
      didYouMean,
      isAutoCorrected,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function nlpSearch(req, res, next) {
  try {
    const { query, page = 1 } = req.query;
    if (!query || !query.trim()) {
      return res.json({
        success: true,
        parsedFilters: {},
        movies: [],
        totalResults: 0
      });
    }

    const parsed = parseNaturalLanguageQuery(query);

    // If specific genres or rating constraints detected, run through discover;
    // otherwise fallback to keyword search if keywords exist
    let result;
    if (parsed.genres.length > 0 || parsed.minRating || parsed.fromYear) {
      result = await tmdbService.discoverMovies({
        genres: parsed.genres,
        genreLogic: 'AND',
        minRating: parsed.minRating,
        fromYear: parsed.fromYear,
        toYear: parsed.toYear,
        sort: parsed.sort === 'rating' ? 'vote_average.desc' : 'popularity.desc',
        page: parseInt(page, 10) || 1,
        minVotes: parsed.minRating ? 300 : 100
      });
    } else if (parsed.keywords) {
      result = await tmdbService.searchMovies(parsed.keywords, parseInt(page, 10) || 1);
    } else {
      result = await tmdbService.discoverMovies({ page: 1, sort: 'popularity.desc' });
    }

    res.json({
      success: true,
      parsedFilters: parsed,
      page: result.page,
      totalPages: result.totalPages,
      totalResults: result.totalResults,
      movies: result.movies
    });
  } catch (error) {
    next(error);
  }
}

export async function getDetails(req, res, next) {
  try {
    const { id } = req.params;
    const data = await movieService.getFullMovieDetails(id);
    if (!data || !data.movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      movie: data.movie,
      recommendations: data.recommendations
    });
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req, res, next) {
  try {
    const { id } = req.params;
    const { page = 1, sort = 'newest' } = req.query;

    const data = await movieService.getSortedMovieReviews(id, parseInt(page, 10) || 1, sort);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function getTrending(req, res, next) {
  try {
    const { timeWindow = 'week' } = req.query;
    const data = await tmdbService.getTrending(timeWindow);
    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurated(req, res, next) {
  try {
    const { category } = req.params;
    const data = await recommendationService.getCuratedCategory(category);
    res.json({
      success: true,
      category,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function quizRecommendations(req, res, next) {
  try {
    const { genre, mood, minRating, era, runtimeLength } = req.body;
    const data = await recommendationService.getQuizRecommendations({
      genre,
      mood,
      minRating,
      era,
      runtimeLength
    });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}

export async function getPersonalized(req, res, next) {
  try {
    const {
      favoriteGenres = [],
      viewedMovieIds = [],
      preferredEras = [],
      lastInteractedMovieId = null
    } = req.body;

    const data = await recommendationService.recommendPersonalizedMovies({
      favoriteGenres,
      viewedMovieIds,
      preferredEras,
      lastInteractedMovieId
    });

    res.json({
      success: true,
      ...data
    });
  } catch (error) {
    next(error);
  }
}
