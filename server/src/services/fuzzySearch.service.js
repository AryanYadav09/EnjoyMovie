/**
 * Fuzzy Search & Typo-Tolerance Service for EnjoyMovie
 * 
 * Provides Damerau-Levenshtein distance, token-level typo correction,
 * phonetic matching, and a comprehensive cinephile vocabulary of popular movies,
 * franchises, directors, and genre terms.
 */

// Comprehensive dictionary of top iconic movies, franchises, directors, and keywords
const CINEPHILE_VOCABULARY = [
  // Blockbusters & Popular Films
  'interstellar', 'inception', 'oppenheimer', 'shutter island', 'the dark knight',
  'the dark knight rises', 'batman begins', 'the shawshank redemption', 'the godfather',
  'the godfather part ii', 'pulp fiction', 'fight club', 'forrest gump', 'the matrix',
  'the matrix reloaded', 'goodfellas', 'se7en', 'seven', 'the silence of the lambs',
  'the silence of lambs', 'saving private ryan', 'spirited away', 'the green mile',
  'parasite', 'gladiator', 'the prestige', 'the departed', 'whiplash', 'the lion king',
  'memento', 'apocalypse now', 'alien', 'aliens', 'django unchained',
  'wall-e', 'the shining', 'avengers endgame', 'avengers infinity war', 'the avengers',
  'avengers', 'spider-man into the spider-verse', 'spider-man across the spider-verse',
  'spider-man no way home', 'spider-man', 'iron man', 'captain america', 'thor ragnarok',
  'black panther', 'guardians of the galaxy', 'doctor strange', 'dune', 'dune part two',
  'blade runner', 'blade runner 2049', 'mad max fury road', 'jurassic park', 'jurassic world',
  'titanic', 'avatar', 'avatar the way of water', 'star wars a new hope',
  'star wars the empire strikes back', 'star wars return of the jedi', 'star wars',
  'the lord of the rings the fellowship of the ring', 'the lord of the rings the two towers',
  'the lord of the rings the return of the king', 'the lord of the rings', 'the hobbit',
  'harry potter and the sorcerer stone', 'harry potter and the prisoner of azkaban',
  'harry potter', 'back to the future', 'terminator 2 judgment day', 'the terminator',
  'psycho', 'rear window', 'vertigo', 'casablanca', 'citizen kane', '12 angry men',
  'schindler list', 'good will hunting', 'dead poets society', 'a beautiful mind',
  'the truman show', 'eternal sunshine of the spotless mind', 'la la land',
  'grand budapest hotel', 'the grand budapest hotel', 'moonrise kingdom', 'fantastic mr fox',
  'no country for old men', 'fargo', 'the big lebowski', 'there will be blood',
  'inglourious basterds', 'reservoir dogs', 'kill bill', 'kill bill vol 1', 'kill bill vol 2',
  'once upon a time in hollywood', 'the hateful eight', 'hateful eight', 'jackie brown',
  'the social network', 'zodiac', 'gone girl', 'panic room', 'the girl with the dragon tattoo',
  'prisoners', 'arrival', 'sicario', 'enemy', 'incendies', 'polytechnique',
  'hereditary', 'midsommar', 'the witch', 'the lighthouse', 'the northman',
  'the conjuring', 'the conjuring 2', 'insidious', 'sinister', 'get out', 'us', 'nope',
  'a quiet place', 'a quiet place part ii', 'her', 'ex machina', 'annihilation',
  'everything everywhere all at once', 'knives out', 'glass onion', 'coco', 'up',
  'inside out', 'inside out 2', 'toy story', 'toy story 2', 'toy story 3', 'finding nemo',
  'monsters inc', 'the incredibles', 'ratatouille', 'ratatouile', 'braveheart',
  'the wolf of wall street', 'wolf of wall street', 'taxi driver', 'raging bull',
  'casino', 'the irishman', 'killers of the flower moon',
  'the revenant', 'birdman', 'gravity', 'children of men', 'pan labyrinth',
  'the shape of water', 'guillermo del toro pinocchio', 'hellboy', 'pacific rim',
  'trainspotting', 'slumdog millionaire', '28 days later', '127 hours',
  'oldboy', 'memories of murder', 'the handmaiden', 'decision to leave',
  'princess mononoke', 'my neighbor totoro', 'howl moving castle',
  'grave of the fireflies', 'your name', 'weathering with you', 'suzume',
  'akira', 'ghost in the shell', 'perfect blue', 'paprika', 'tokyo godfathers',
  'the thing', 'halloween', 'escape from new york', 'carrie', 'the exorcist',
  'rosemary baby', 'texas chain saw massacre', 'a nightmare on elm street',
  'scream', 'saw', 'the ring', 'the grudge', 'paranormal activity',
  'barbie', 'poor things', 'the holdovers', 'past lives',
  'anatomy of a fall', 'zone of interest', 'the zone of interest', 'challengers',
  'furiosa a mad max saga', 'twisters', 'alien romulus', 'deadpool and wolverine',
  'deadpool', 'logan', 'x-men days of future past', 'joker', 'the batman',

  // Common Directors & Creators
  'christopher nolan', 'quentin tarantino', 'martin scorsese', 'steven spielberg',
  'stanley kubrick', 'david fincher', 'denis villeneuve', 'alfred hitchcock',
  'ridley scott', 'james cameron', 'george lucas', 'peter jackson', 'hayao miyazaki',
  'bong joon-ho', 'park chan-wook', 'guillermo del toro', 'alfonso cuaron',
  'wes anderson', 'paul thomas anderson', 'coen brothers', 'david lynch',
  'greta gerwig', 'jordan peele', 'ari aster', 'damien chazelle', 'robert eggers',

  // Common Keyphrases and Genres
  'science fiction', 'psychological thriller', 'neo-noir', 'supernatural horror',
  'time travel', 'apocalyptic', 'cyberpunk', 'space exploration', 'serial killer',
  'mind-bending', 'heist movie', 'zombie apocalypse', 'martial arts'
];

/**
 * Calculate Damerau-Levenshtein distance between two strings
 * Handles insertions, deletions, substitutions, and adjacent transpositions.
 */
export function damerauLevenshteinDistance(str1, str2) {
  const s1 = String(str1 || '').toLowerCase().trim();
  const s2 = String(str2 || '').toLowerCase().trim();

  const len1 = s1.length;
  const len2 = s2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;
  if (s1 === s2) return 0;

  // Matrix initialization
  const d = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) d[i][0] = i;
  for (let j = 0; j <= len2; j++) d[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;

      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        s1[i - 1] === s2[j - 2] &&
        s1[i - 2] === s2[j - 1]
      ) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[len1][len2];
}

/**
 * Normalized string similarity ratio: 0.0 (completely different) to 1.0 (identical)
 */
export function stringSimilarity(str1, str2) {
  const s1 = String(str1 || '').toLowerCase().trim();
  const s2 = String(str2 || '').toLowerCase().trim();

  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;

  const dist = damerauLevenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Tokenize a phrase into alphanumeric words
 */
export function tokenize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Find the closest matching entry from vocabulary for a given query
 */
export function findClosestMatch(query, maxDistanceThreshold = 3) {
  const clean = String(query || '').toLowerCase().trim();
  if (!clean) return null;

  let bestMatch = null;
  let bestDist = Infinity;
  let bestSimilarity = 0;

  // 1. Full phrase comparison
  for (const item of CINEPHILE_VOCABULARY) {
    const dist = damerauLevenshteinDistance(clean, item);
    const sim = 1 - dist / Math.max(clean.length, item.length);

    if (dist < bestDist || (dist === bestDist && sim > bestSimilarity)) {
      bestDist = dist;
      bestSimilarity = sim;
      bestMatch = item;
    }
  }

  // Calculate acceptable distance based on length
  const maxAllowed = clean.length <= 4 ? 1 : (clean.length <= 8 ? 2 : maxDistanceThreshold);

  if (bestDist > 0 && bestDist <= maxAllowed && bestSimilarity >= 0.65) {
    return {
      corrected: bestMatch,
      distance: bestDist,
      similarity: Number(bestSimilarity.toFixed(2))
    };
  }

  // 2. Token-by-token matching for multi-word phrases (e.g. "shuter island")
  const tokens = tokenize(clean);
  if (tokens.length > 1) {
    let correctedTokens = [];
    let anyTokenCorrected = false;

    for (const token of tokens) {
      if (token.length <= 2) {
        correctedTokens.push(token);
        continue;
      }

      let bestTokenMatch = token;
      let minTokenDist = Infinity;

      // Check against single words in vocabulary
      for (const phrase of CINEPHILE_VOCABULARY) {
        const phraseWords = phrase.split(' ');
        for (const word of phraseWords) {
          if (Math.abs(word.length - token.length) > 2) continue;
          const d = damerauLevenshteinDistance(token, word);
          if (d < minTokenDist && d <= (token.length <= 5 ? 1 : 2)) {
            minTokenDist = d;
            bestTokenMatch = word;
          }
        }
      }

      if (minTokenDist > 0 && minTokenDist <= 2 && bestTokenMatch !== token) {
        anyTokenCorrected = true;
        correctedTokens.push(bestTokenMatch);
      } else {
        correctedTokens.push(token);
      }
    }

    if (anyTokenCorrected) {
      const reconstructed = correctedTokens.join(' ');
      const sim = stringSimilarity(clean, reconstructed);
      return {
        corrected: reconstructed,
        distance: damerauLevenshteinDistance(clean, reconstructed),
        similarity: Number(sim.toFixed(2))
      };
    }
  }

  return null;
}

/**
 * Capitalize titles properly for display ("the dark knight" -> "The Dark Knight")
 */
export function formatDisplayTitle(str) {
  if (!str) return '';
  const minorWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);
  const words = str.toLowerCase().split(' ');
  return words.map((w, idx) => {
    if (idx > 0 && minorWords.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}
