/**
 * Bayesian Weighted Rating & Quality Score Algorithm
 *
 * Prevents low-vote skew (e.g., 9.1 with 300 votes vs 8.7 with 500,000 votes).
 * Formula:
 *   WR = (v / (v + m)) * R + (m / (v + m)) * C
 * Where:
 *   R = average rating (IMDb primary, TMDB fallback)
 *   v = number of votes
 *   m = minimum votes required to be considered credible (default 1,000)
 *   C = the mean rating across the whole database (~6.8)
 *
 * Additional weights:
 *   + Popularity factor (log-scaled, up to +0.4)
 *   + Recency dampening/bonus (subtle boost for modern active cinema)
 */

export function calculateQualityScore({
  imdbRating,
  tmdbRating,
  imdbVotes,
  tmdbVotes,
  popularity = 0,
  releaseDate
}) {
  // Extract primary rating and vote count
  const parsedImdb = imdbRating ? parseFloat(imdbRating) : null;
  const parsedTmdb = tmdbRating ? parseFloat(tmdbRating) : null;

  const R = !isNaN(parsedImdb) && parsedImdb > 0 
    ? parsedImdb 
    : (!isNaN(parsedTmdb) && parsedTmdb > 0 ? parsedTmdb : 5.0);

  const rawVotes = (imdbVotes && typeof imdbVotes === 'number' && imdbVotes > 0)
    ? imdbVotes
    : (tmdbVotes && typeof tmdbVotes === 'number' && tmdbVotes > 0 ? tmdbVotes : 0);

  const m = 1000; // Minimum vote threshold for full credibility
  const C = 6.8;  // Prior mean movie score

  // Bayesian weighted rating
  const bayesianScore = (rawVotes / (rawVotes + m)) * R + (m / (rawVotes + m)) * C;

  // Logarithmic popularity bonus (caps at +0.35)
  const popBonus = popularity > 0 ? Math.min(0.35, Math.log10(popularity + 1) * 0.1) : 0;

  // Recency bonus: slight boost for movies released in last 5 years (+0.1)
  let recencyBonus = 0;
  if (releaseDate) {
    const releaseYear = new Date(releaseDate).getFullYear();
    const currentYear = new Date().getFullYear();
    if (!isNaN(releaseYear) && releaseYear >= currentYear - 5) {
      recencyBonus = 0.1;
    }
  }

  const finalScore = Math.min(10, Math.max(0, bayesianScore + popBonus + recencyBonus));
  return Number(finalScore.toFixed(2));
}

/**
 * Format vote counts into human-readable compact numbers (e.g., 1.5M, 24K)
 */
export function formatVoteCount(votes) {
  if (!votes || isNaN(votes)) return '0';
  if (votes >= 1000000) {
    return (votes / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (votes >= 1000) {
    return (votes / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return votes.toString();
}
