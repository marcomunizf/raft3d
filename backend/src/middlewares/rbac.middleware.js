/**
 * Role-based access control middleware.
 * Usage: requireRole('ADMIN') or requireRole('ADMIN', 'FUNCIONARIO')
 */
function requireRole(...roles) {
  return function (req, res, next) {
    const userRole = req.user && req.user.role;

    if (!userRole || !roles.includes(userRole)) {
      const error = new Error('Forbidden: insufficient permissions');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    return next();
  };
}

module.exports = { requireRole };
