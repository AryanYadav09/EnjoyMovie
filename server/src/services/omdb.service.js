import axios from 'axios';
import { config } from '../config/env.js';
import { cache, TTL } from '../cache/cache.js';

/**
 * Fetch movie enrichment from OMDb using IMDb ID (tt...)
 */
export async function getOmdbData(imdbId) {
  if (!imdbId || !imdbId.startsWith('tt')) {
    return null;
  }

  const cacheKey = `omdb:${imdbId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  if (!config.omdb.apiKey) {
    // OMDb API key is not configured; return null gracefully
    return null;
  }

  try {
    const res = await axios.get(config.omdb.baseUrl, {
      params: {
        apikey: config.omdb.apiKey,
        i: imdbId
      },
      timeout: 5000
    });

    if (res.data && res.data.Response !== 'False') {
      cache.set(cacheKey, res.data, TTL.MOVIE_DETAILS);
      return res.data;
    }

    return null;
  } catch (error) {
    // Graceful fallback: do not crash on OMDb failure
    console.warn(`OMDb enrichment unavailable for ${imdbId}:`, error.message);
    return null;
  }
}
