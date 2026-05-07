'use strict';
require('dotenv').config();

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config   = require('./config/config');
const apiRoutes = require('./routes');
const response  = require('./utils/response.helper');

const app = express();

// ── 1. Seguridad: Headers HTTP seguros ───────────────────────────────────────
app.use(helmet());

// ── 2. CORS restringido al frontend ──────────────────────────────────────────
app.use(cors({
  origin:      config.frontendUrl,
  credentials: true,               // permite enviar/recibir cookies
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 3. Rate Limiting general ──────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: config.rateLimit.general.windowMs,
  max:      config.rateLimit.general.max,
  message:  {
    success: false,
    message: 'Demasiadas solicitudes. Intenta en un momento.',
    data: null,
    errors: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── 4. Parsers ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));          // límite de payload
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── 5. Rutas de la API ────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// ── 6. Health check ───────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API Gestión de Vuelos — OK', data: { uptime: process.uptime() } });
});

// ── 7. Ruta no encontrada ─────────────────────────────────────────────────────
app.use((_req, res) => {
  response.error(res, 'Ruta no encontrada', 404);
});

// ── 8. Middleware global de manejo de errores ─────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);

  // Error de trigger MySQL (SIGNAL SQLSTATE '45xxx')
  if (err.original?.sqlState?.startsWith('45')) {
    return response.error(res, err.original.sqlMessage, 400);
  }

  // Unique constraint de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    return response.error(res, 'Ya existe un registro con esos datos', 409);
  }

  // Validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return response.error(res, 'Datos inválidos', 422, errors);
  }

  // Error de conexión a DB
  if (err.name === 'SequelizeConnectionError') {
    return response.error(res, 'Error de conexión con la base de datos', 503);
  }

  // Error genérico — ocultar stack en producción
  const statusCode = err.statusCode || err.status || 500;
  const message = config.isProduction ? 'Error interno del servidor' : err.message;
  const errors  = config.isProduction ? null : [{ stack: err.stack }];

  return response.error(res, message, statusCode, errors);
});

module.exports = app;
