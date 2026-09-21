/**
 * Rule-based Natural Language Query Parser for Movie Discovery
 * Translates conversational user inputs into structured filter criteria.
 */

const GENRE_KEYWORDS = {
  action: 'Action',
  adventure: 'Adventure',
  animation: 'Animation',
  animated: 'Animation',
  anime: 'Animation',
  comedy: 'Comedy',
  funny: 'Comedy',
  crime: 'Crime',
  gangster: 'Crime',
  mafia: 'Crime',
  documentary: 'Documentary',
  doc: 'Documentary',
  drama: 'Drama',
  dramatic: 'Drama',
  family: 'Family',
  kids: 'Family',
  fantasy: 'Fantasy',
  history: 'History',
  historical: 'History',
  horror: 'Horror',
  scary: 'Horror',
  spooky: 'Horror',
  music: 'Music',
  musical: 'Music',
  mystery: 'Mystery',
  detective: 'Mystery',
  romance: 'Romance',
  romantic: 'Romance',
  love: 'Romance',
  'sci-fi': 'Science Fiction',
  scifi: 'Science Fiction',
  'science fiction': 'Science Fiction',
  alien: 'Science Fiction',
  space: 'Science Fiction',
  thriller: 'Thriller',
  suspense: 'Thriller',
  psychological: 'Thriller',
  war: 'War',
  western: 'Western',
  cowboy: 'Western'
};

export function parseNaturalLanguageQuery(query) {
  if (!query || typeof query !== 'string') {
    return {
      rawQuery: '',
      genres: [],
      minRating: null,
      fromYear: null,
      toYear: null,
      sort: 'popular',
      keywords: ''
    };
  }

  const text = query.toLowerCase().trim();
  const foundGenres = new Set();
  let minRating = null;
  let fromYear = null;
  let toYear = null;
  let sort = 'popular';
  const currentYear = new Date().getFullYear();

  // 1. Detect Genres
  for (const [kw, genreName] of Object.entries(GENRE_KEYWORDS)) {
    // Regex matches whole word
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(text)) {
      foundGenres.add(genreName);
    }
  }

  // 2. Detect Rating thresholds
  // e.g. "rating above 8", "ratings over 7.5", "rating > 8", "8+ rating", "min 7 rating", "rated 8"
  const ratingMatch = text.match(/(?:rating[s]?\s*(?:above|over|>|greater than|at least|minimum|min)?\s*|rated\s*)(\d(?:\.\d)?)/i)
    || text.match(/(\d(?:\.\d)?)\s*\+\s*(?:rating|stars)?/i);

  if (ratingMatch && ratingMatch[1]) {
    const val = parseFloat(ratingMatch[1]);
    if (val >= 1 && val <= 10) {
      minRating = val;
    }
  } else if (text.includes('highly rated') || text.includes('high rating')) {
    minRating = 7.5;
  } else if (text.includes('top rated') || text.includes('best rated')) {
    minRating = 8.0;
  }

  // 3. Detect Year and Era ranges
  // "from 2010", "after 2015", "since 2000", "2010 onwards"
  const fromYearMatch = text.match(/(?:from|after|since)\s*(\d{4})/i)
    || text.match(/(\d{4})\s*(?:onwards|and after|\+)/i);
  if (fromYearMatch && fromYearMatch[1]) {
    fromYear = parseInt(fromYearMatch[1], 10);
  }

  // "before 2000", "until 2015"
  const toYearMatch = text.match(/(?:before|until|to)\s*(\d{4})/i);
  if (toYearMatch && toYearMatch[1]) {
    toYear = parseInt(toYearMatch[1], 10);
  }

  // "between 1990 and 2005"
  const betweenMatch = text.match(/between\s*(\d{4})\s*(?:and|to|-)\s*(\d{4})/i);
  if (betweenMatch) {
    fromYear = parseInt(betweenMatch[1], 10);
    toYear = parseInt(betweenMatch[2], 10);
  }

  // "last 5 years", "last 10 years"
  const lastNYearsMatch = text.match(/last\s*(\d+)\s*years/i);
  if (lastNYearsMatch && lastNYearsMatch[1]) {
    const n = parseInt(lastNYearsMatch[1], 10);
    fromYear = currentYear - n;
  }

  // Decade: "90s", "1990s", "80s", "2000s", "2010s"
  if (/\b(?:90s|1990s)\b/i.test(text)) {
    fromYear = 1990;
    toYear = 1999;
  } else if (/\b(?:80s|1980s)\b/i.test(text)) {
    fromYear = 1980;
    toYear = 1989;
  } else if (/\b(?:70s|1970s)\b/i.test(text)) {
    fromYear = 1970;
    toYear = 1979;
  } else if (/\b(?:2000s)\b/i.test(text)) {
    fromYear = 2000;
    toYear = 2009;
  } else if (/\b(?:2010s)\b/i.test(text)) {
    fromYear = 2010;
    toYear = 2019;
  }

  // 4. Detect Sort preferences
  if (/\b(highest rated|top rated|best rated|highest score)\b/i.test(text)) {
    sort = 'rating';
  } else if (/\b(newest|latest|recent|new releases)\b/i.test(text)) {
    sort = 'newest';
  } else if (/\b(most voted|most votes|most popular|popular)\b/i.test(text)) {
    sort = 'popular';
  } else if (/\b(oldest|classics)\b/i.test(text)) {
    sort = 'oldest';
  }

  // 5. Clean remaining words to extract any specific movie or director keyword
  let cleaned = text
    .replace(/\b(find|give|show|me|i want|looking for|movies|films|flicks|with|and|the|a|an|from|after|before|since|rated|rating|above|over|high|top|best|last|years|onwards)\b/gi, ' ')
    .replace(/\b\d{4}\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove matched genre words from cleaned
  for (const kw of Object.keys(GENRE_KEYWORDS)) {
    const r = new RegExp(`\\b${kw}\\b`, 'gi');
    cleaned = cleaned.replace(r, '').trim();
  }

  return {
    rawQuery: query,
    genres: Array.from(foundGenres),
    minRating,
    fromYear,
    toYear,
    sort,
    keywords: cleaned
  };
}
