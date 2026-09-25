import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.message || error.message || 'Network request failed';
    return Promise.reject(new Error(message));
  }
);

export const movieApi = {
  getGenres: () => api.get('/genres'),

  discover: (params = {}, signal) => 
    api.get('/movies/discover', { params, signal }),

  search: (query, page = 1, signal) => 
    api.get('/movies/search', { params: { query, page }, signal }),

  nlpSearch: (query, page = 1, signal) => 
    api.get('/movies/nlp-search', { params: { query, page }, signal }),

  getDetails: (id) => 
    api.get(`/movies/${id}`),

  getReviews: (id, page = 1, sort = 'newest') => 
    api.get(`/movies/${id}/reviews`, { params: { page, sort } }),

  getTrending: (timeWindow = 'week') => 
    api.get('/movies/trending', { params: { timeWindow } }),

  getCurated: (category) => 
    api.get(`/movies/curated/${category}`),

  quizRecommendations: (answers) => 
    api.post('/movies/quiz-recommendations', answers),

  getPersonalized: (payload) =>
    api.post('/movies/personalized', payload),

  checkHealth: () => 
    api.get('/health'),

  getConfigStatus: () => 
    api.get('/config/status'),

  updateApiKey: (payload) => 
    api.post('/config/api-key', payload)
};

export default movieApi;

