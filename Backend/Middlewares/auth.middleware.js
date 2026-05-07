'use strict';
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const response  = require('../utils/response.helper');
const config    = require('../config/config');

/**
 * Middleware de autenticación.
 * Extrae el JWT de la cookie httpOnly, lo verifica y carga el usuario en req.user.
 */
async function authenticate(req, res, next) {
  try {
    // 1. Extraer token de la cookie
    const token = req.cookies?.[config.cookie.name];
    if (!token) {
      return response.error(res, 'No autorizado — token requerido', 401);
    }

    // 2. Verificar firma y expiración
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (jwtErr) {
      const msg = jwtErr.name === 'TokenExpiredError'
        ? 'Sesión expirada, inicia sesión nuevamente'
        : 'Token inválido';
      return response.error(res, msg, 401);
    }

    // 3. Verificar que el usuario aún exista y esté activo
    // Usamos scope 'withPassword' para cargar todos los atributos (incluido isActive)
    // pero luego NO lo exponemos en ninguna respuesta.
    const user = await User.scope('withPassword').findOne({
      where: { id: decoded.id, isActive: 1 },
      attributes: ['id', 'name', 'email', 'role', 'isActive'],
    });

    if (!user) {
      return response.error(res, 'Usuario no encontrado o desactivado', 401);
    }

    // 4. Adjuntar usuario a la request
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
