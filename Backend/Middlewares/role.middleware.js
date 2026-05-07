'use strict';
const response = require('../utils/response.helper');

/**
 * Factory de middleware de roles.
 * Uso: requireRole('admin') o requireRole('client') o requireRole('admin', 'client')
 *
 * @param {...string} roles - Roles permitidos
 * @returns {Function} Middleware Express
 */
function requireRole(...roles) {
  return (req, res, next) => {
    // El middleware authenticate debe haber corrido primero
    if (!req.user) {
      return response.error(res, 'No autorizado', 401);
    }

    if (!roles.includes(req.user.role)) {
      return response.error(
        res,
        `Acceso denegado — se requiere rol: ${roles.join(' o ')}`,
        403
      );
    }

    next();
  };
}

module.exports = { requireRole };
