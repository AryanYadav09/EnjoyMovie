import * as tmdbService from '../services/tmdb.service.js';

export async function getGenres(req, res, next) {
  try {
    const data = await tmdbService.getGenres();
    res.json({
      success: true,
      genres: data.genres
    });
  } catch (error) {
    next(error);
  }
}
