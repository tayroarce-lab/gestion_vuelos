'use strict';

/**
 * Helper estándar de respuestas HTTP.
 * Todas las respuestas de la API siguen el mismo contrato:
 *   { success, message, data, errors }
 */

/**
 * Respuesta exitosa.
 * @param {object} res        - Express response object
 * @param {*}      data       - Payload a enviar (null si no aplica)
 * @param {string} message    - Mensaje descriptivo
 * @param {number} statusCode - Código HTTP (default 200)
 */
function success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
}

/**
 * Respuesta de error.
 * @param {object}        res        - Express response object
 * @param {string}        message    - Mensaje de error
 * @param {number}        statusCode - Código HTTP (default 500)
 * @param {Array|null}    errors     - Array de errores de validación (opcional)
 */
function error(res, message = 'Error interno del servidor', statusCode = 500, errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  });
}

module.exports = { success, error };
