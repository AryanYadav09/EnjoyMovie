export function errorHandler(err, req, res, next) {
  // Log server-side only for debugging
  console.error('[EnjoyMovie Error]:', err.message || err);

  // Status code
  const statusCode = err.status || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // Return clean, sanitized JSON to frontend - NEVER expose API keys or internal stack traces
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred while processing movie data',
    code: err.code || 'INTERNAL_ERROR'
  });
}
