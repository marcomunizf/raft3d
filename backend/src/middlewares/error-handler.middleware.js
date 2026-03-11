function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const error = err.code || (status === 401 ? 'UNAUTHORIZED' : 'INTERNAL_ERROR');
  const message = err.message || 'Unexpected error';
  const payload = { error, message };

  if (err.details) {
    payload.details = err.details;
  }

  res.status(status).json(payload);
}

module.exports = { errorHandler };
