function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.statusCode || 500} ${err.code || 'INTERNAL_ERROR'}: ${err.message}`);
  }

  const status = err.statusCode || 500;
  const error = err.code || (status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR');
  const message = (isProd && status === 500) ? 'Internal server error' : (err.message || 'Unexpected error');
  const payload = { error, message };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };
