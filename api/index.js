import app from '../server/src/app.js';

export default function handler(req, res) {
  // Normalize req.url to ensure /api prefix exists for Express route matching
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  return app(req, res);
}
