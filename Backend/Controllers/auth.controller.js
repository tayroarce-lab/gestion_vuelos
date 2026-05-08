'use strict';
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const { User } = require('../models');
const response = require('../utils/response.helper');
const config   = require('../config/config');

// Hash dummy para prevenir timing attacks cuando el usuario no existe
const DUMMY_HASH = '$2a$12$dummyhashusedtopreventtimingattacksonloginendpoint0000';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Genera y setea la cookie httpOnly con el JWT.
 */
function issueTokenCookie(res, user) {
  const payload = { id: user.id, email: user.email, role: user.role };
  const token   = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    secure:   config.isProduction,     // HTTPS solo en producción
    sameSite: 'strict',
    maxAge:   config.cookie.maxAge,    // ms
  });
}

/**
 * Objeto seguro del usuario (sin passwordHash ni campos internos).
 */
function safeUser(user) {
  return {
    id:        user.id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    isActive:  user.isActive,
    createdAt: user.created_at,
  };
}

// ── Controladores ────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Registra un nuevo cliente. El rol siempre es 'client'.
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Comprobar si el email ya existe (409 Conflict)
    const existing = await User.unscoped().findOne({ where: { email } });
    if (existing) {
      return response.error(res, 'El email ya está registrado', 409);
    }

    // Crear usuario — el hook beforeCreate hasheará la contraseña
    const user = await User.create({
      name,
      email,
      passwordHash: password, // el hook lo hashea antes de persistir
      role: 'client',
    });

    // Emitir cookie JWT automáticamente al registrarse
    issueTokenCookie(res, user);

    return response.success(res, safeUser(user), 'Registro exitoso', 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return response.error(res, 'El email ya está registrado', 409);
    }
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Autentica al usuario y emite un JWT en httpOnly cookie.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Buscar usuario incluyendo explícitamente el hash de la contraseña
    const user = await User.findOne({ 
      where: { email },
      attributes: { include: ['passwordHash'] } 
    });

    // SEGURIDAD: siempre ejecutar bcrypt.compare para evitar timing attacks
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      return response.error(res, 'Credenciales inválidas', 401);
    }

    if (!user.isActive) {
      return response.error(res, 'Tu cuenta está desactivada. Contacta al administrador', 401);
    }

    issueTokenCookie(res, user);

    return response.success(res, safeUser(user), 'Login exitoso');
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 * Limpia la cookie JWT.
 */
function logout(req, res) {
  res.clearCookie(config.cookie.name, {
    httpOnly: true,
    secure:   config.isProduction,
    sameSite: 'strict',
  });
  return response.success(res, null, 'Sesión cerrada exitosamente');
}

/**
 * GET /api/auth/me
 * Retorna el perfil del usuario autenticado.
 */
async function me(req, res, next) {
  try {
    // req.user ya viene del auth.middleware (sin passwordHash)
    return response.success(res, safeUser(req.user), 'Perfil del usuario');
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me };
