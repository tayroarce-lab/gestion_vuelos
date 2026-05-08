'use strict';
require('dotenv').config();

module.exports = {
  // ── Server ──────────────────────────────────────────
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // ── Database ─────────────────────────────────────────
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    name: process.env.NODE_ENV === 'test' ? 'vuelos_test_db' : (process.env.DB_NAME || 'vuelos_db'),
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || '',
  },

  // ── JWT ──────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
  },

  // ── Cookie ───────────────────────────────────────────
  cookie: {
    name: 'token',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) || 86_400_000, // 24h
  },

  // ── CORS ─────────────────────────────────────────────
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // ── Rate Limiting ─────────────────────────────────────
  rateLimit: {
    general: { windowMs: 60_000, max: 100 },        // 100/min
    login:    { windowMs: 15 * 60_000, max: 5 },    // 5/15min
    register: { windowMs: 60 * 60_000, max: 3 },    // 3/hora
  },

  // ── bcrypt ────────────────────────────────────────────
  bcrypt: { saltRounds: 12 },
};
