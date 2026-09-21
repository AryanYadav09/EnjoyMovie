import app from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🎬 EnjoyMovie Server running on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🔑 TMDB configured: ${Boolean(config.tmdb.apiKey || config.tmdb.accessToken)}`);
  console.log(`🔑 OMDb configured: ${Boolean(config.omdb.apiKey)}`);
  console.log(`===========================================`);
});
