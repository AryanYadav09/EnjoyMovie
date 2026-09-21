import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';
import { cache } from '../cache/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

export async function getConfigStatus(req, res) {
  res.json({
    success: true,
    tmdbConfigured: Boolean(config.tmdb.apiKey || config.tmdb.accessToken),
    omdbConfigured: Boolean(config.omdb.apiKey),
    catalogMode: Boolean(config.tmdb.apiKey || config.tmdb.accessToken) ? 'live' : 'offline_curated'
  });
}

export async function updateApiKey(req, res, next) {
  try {
    const { tmdbApiKey, omdbApiKey } = req.body;

    if (!tmdbApiKey && !omdbApiKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a TMDB API Key or OMDb API Key'
      });
    }

    // Verify TMDB key if provided
    if (tmdbApiKey) {
      try {
        await axios.get('https://api.themoviedb.org/3/configuration', {
          params: { api_key: tmdbApiKey.trim() },
          timeout: 6000
        });
        // Key is valid!
        config.tmdb.apiKey = tmdbApiKey.trim();
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Verification failed: TMDB rejected this API key. Please check your credentials from themoviedb.org/settings/api'
        });
      }
    }

    if (omdbApiKey) {
      config.omdb.apiKey = omdbApiKey.trim();
    }

    // Persist to server/.env
    try {
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      if (tmdbApiKey) {
        if (/^TMDB_API_KEY=.*/m.test(envContent)) {
          envContent = envContent.replace(/^TMDB_API_KEY=.*/m, `TMDB_API_KEY=${tmdbApiKey.trim()}`);
        } else {
          envContent += `\nTMDB_API_KEY=${tmdbApiKey.trim()}`;
        }
      }

      if (omdbApiKey) {
        if (/^OMDB_API_KEY=.*/m.test(envContent)) {
          envContent = envContent.replace(/^OMDB_API_KEY=.*/m, `OMDB_API_KEY=${omdbApiKey.trim()}`);
        } else {
          envContent += `\nOMDB_API_KEY=${omdbApiKey.trim()}`;
        }
      }

      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    } catch (saveErr) {
      console.warn('Could not write to .env file:', saveErr.message);
    }

    // Clear cache to immediately load live data
    cache.flush();

    res.json({
      success: true,
      message: 'TMDB API connected successfully! Live database with 800,000+ movies is now unlocked.',
      tmdbConfigured: true,
      omdbConfigured: Boolean(config.omdb.apiKey)
    });
  } catch (error) {
    next(error);
  }
}
