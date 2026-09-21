import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

import genreRoutes from './routes/genre.routes.js';
import movieRoutes from './routes/movie.routes.js';
import configRoutes from './routes/config.routes.js';

const app = express();

// Trust reverse proxy (Vercel / Cloudflare / Nginx)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration - Supports localhost, configured CLIENT_URL, and Vercel domains
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      config.clientUrl === '*'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json());

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// Health check and root API endpoints
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EnjoyMovie API is running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'EnjoyMovie API',
    tmdbConfigured: Boolean(config.tmdb.apiKey || config.tmdb.accessToken),
    omdbConfigured: Boolean(config.omdb.apiKey)
  });
});

// Mount Routes
app.use('/api/genres', genreRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/config', configRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
