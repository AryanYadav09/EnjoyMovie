import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ActivityContext = createContext();

const STORAGE_KEYS = {
  TASTE_PROFILE: 'movie_finder_taste_profile_v1',
  ACTIVITY_LOG: 'movie_finder_activity_log_v1'
};

const INITIAL_PROFILE = {
  genreWeights: {}, // { 'Science Fiction': 12, 'Thriller': 8 }
  viewedMovieIds: [],
  recentSearches: [],
  lastInteractedMovieId: null,
  totalInteractions: 0
};

export function ActivityProvider({ children }) {
  const [tasteProfile, setTasteProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASTE_PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_PROFILE;
    } catch {
      return INITIAL_PROFILE;
    }
  });

  const [recentInteractions, setRecentInteractions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist taste profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASTE_PROFILE, JSON.stringify(tasteProfile));
    } catch (e) {
      console.warn('Could not save taste profile to localStorage:', e);
    }
  }, [tasteProfile]);

  // Persist activity log to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(recentInteractions.slice(-50)));
    } catch (e) {
      console.warn('Could not save activity log to localStorage:', e);
    }
  }, [recentInteractions]);

  /**
   * Log an activity and increment taste weights
   */
  const logActivity = useCallback((type, data, weight = 1) => {
    setTasteProfile(prev => {
      const updatedGenres = { ...prev.genreWeights };

      // Update genre affinity
      if (Array.isArray(data.genres)) {
        data.genres.forEach(g => {
          if (!g) return;
          const genreName = typeof g === 'string' ? g : g.name;
          updatedGenres[genreName] = (updatedGenres[genreName] || 0) + weight;
        });
      }

      // Update viewed movie IDs
      const updatedViewed = prev.viewedMovieIds.includes(data.id)
        ? prev.viewedMovieIds
        : [data.id, ...prev.viewedMovieIds].slice(0, 100);

      return {
        ...prev,
        genreWeights: updatedGenres,
        viewedMovieIds: updatedViewed,
        lastInteractedMovieId: data.id || prev.lastInteractedMovieId,
        totalInteractions: prev.totalInteractions + 1
      };
    });

    setRecentInteractions(prev => [
      {
        id: Date.now(),
        type,
        title: data.title || data.query,
        timestamp: new Date().toISOString()
      },
      ...prev
    ].slice(0, 30));
  }, []);

  /**
   * Record when user clicks on a movie card
   */
  const recordMovieClick = useCallback((movie) => {
    if (!movie || !movie.id) return;
    logActivity('CLICK', movie, 2);
  }, [logActivity]);

  /**
   * Record when user views movie details
   */
  const recordMovieView = useCallback((movie) => {
    if (!movie || !movie.id) return;
    logActivity('VIEW', movie, 3);
  }, [logActivity]);

  /**
   * Record search queries
   */
  const recordSearch = useCallback((query) => {
    if (!query || !query.trim()) return;
    const clean = query.trim();

    setTasteProfile(prev => {
      const updatedSearches = [clean, ...prev.recentSearches.filter(s => s !== clean)].slice(0, 10);
      return {
        ...prev,
        recentSearches: updatedSearches,
        totalInteractions: prev.totalInteractions + 1
      };
    });

    setRecentInteractions(prev => [
      {
        id: Date.now(),
        type: 'SEARCH',
        title: `Search: "${clean}"`,
        timestamp: new Date().toISOString()
      },
      ...prev
    ].slice(0, 30));
  }, []);

  /**
   * Record watchlist additions
   */
  const recordWatchlistAdd = useCallback((movie) => {
    if (!movie || !movie.id) return;
    logActivity('WATCHLIST_ADD', movie, 5); // Highest affinity signal
  }, [logActivity]);

  /**
   * Get sorted array of favorite genres for API consumption
   */
  const getTopGenres = useCallback(() => {
    return Object.entries(tasteProfile.genreWeights)
      .map(([genre, weight]) => ({ genre, weight }))
      .sort((a, b) => b.weight - a.weight);
  }, [tasteProfile.genreWeights]);

  /**
   * Clear taste profile & reset viewing history
   */
  const resetTasteProfile = useCallback(() => {
    setTasteProfile(INITIAL_PROFILE);
    setRecentInteractions([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.TASTE_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
    } catch {}
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        tasteProfile,
        recentInteractions,
        topGenres: getTopGenres(),
        recordMovieClick,
        recordMovieView,
        recordSearch,
        recordWatchlistAdd,
        resetTasteProfile
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
