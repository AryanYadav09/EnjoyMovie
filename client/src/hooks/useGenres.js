import { useState, useEffect } from 'react';
import { movieApi } from '../services/api.js';

let cachedGenres = null;

export function useGenres() {
  const [genres, setGenres] = useState(cachedGenres || []);
  const [loading, setLoading] = useState(!cachedGenres);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (cachedGenres) {
      setGenres(cachedGenres);
      setLoading(false);
      return;
    }

    let isMounted = true;
    movieApi.getGenres()
      .then(res => {
        if (isMounted) {
          const list = res.genres || [];
          cachedGenres = list;
          setGenres(list);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { genres, loading, error };
}
