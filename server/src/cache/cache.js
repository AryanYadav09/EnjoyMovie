/**
 * In-Memory TTL Cache with automatic expiration and LRU-like pruning.
 * Designed so a Redis client can easily replace it when REDIS_URL is present.
 */

class MemoryCache {
  constructor(defaultTTLSeconds = 900) {
    this.cache = new Map();
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  set(key, value, ttlSeconds) {
    const ttl = (ttlSeconds ? ttlSeconds * 1000 : this.defaultTTL);
    const expiresAt = Date.now() + ttl;
    
    // Simple LRU-style cleanup if map grows too large (> 5000 items)
    if (this.cache.size > 5000) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.cache.delete(key);
  }

  flush() {
    this.cache.clear();
  }
}

export const cache = new MemoryCache();

export const TTL = {
  GENRES: 24 * 60 * 60, // 24 hours
  MOVIE_DETAILS: 6 * 60 * 60, // 6 hours
  REVIEWS: 60 * 60, // 1 hour
  DISCOVER: 15 * 60, // 15 minutes
  SEARCH: 10 * 60, // 10 minutes
  TRENDING: 30 * 60 // 30 minutes
};
