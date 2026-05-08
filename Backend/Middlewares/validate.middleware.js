'use strict';
const { validationResult } = require('express-validator');
const response = require('../utils/response.helper');

/**
 * Ejecuta los resultados de express-validator y retorna 422 si hay errores.
 * Debe ir DESPUÉS de los validators en el array de middlewares de la ruta.
 */
function handleValidationErrors(req, res, next) {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const errors = result.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    console.log('VALIDATION ERRORS:', JSON.stringify(errors, null, 2));
    return response.error(res, 'Datos de entrada inválidos', 422, errors);
  }

  next();
}

module.exports = { handleValidationErrors };
