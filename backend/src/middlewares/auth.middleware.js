const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  const scheme = parts[0];
  const token = parts[1];

  if (scheme !== 'Bearer' || !token) {
    const error = new Error('Missing auth token');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return next(error);
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (err) {
    const error = new Error('Invalid auth token');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return next(error);
  }
}

module.exports = { requireAuth };
