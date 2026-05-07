'use strict';
const { Router }   = require('express');
const rateLimit    = require('express-rate-limit');
const { body }     = require('express-validator');
const config       = require('../config/config');
const authCtrl     = require('../controllers/auth.controller');
const { authenticate }         = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// ── Rate limiters específicos de auth ────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.login.windowMs,
  max:      config.rateLimit.login.max,
  message:  { success: false, message: 'Demasiados intentos. Intenta en 15 minutos.', data: null, errors: null },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: config.rateLimit.register.windowMs,
  max:      config.rateLimit.register.max,
  message:  { success: false, message: 'Demasiados registros desde esta IP. Intenta en 1 hora.', data: null, errors: null },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Validaciones ─────────────────────────────────────────────────────────────
const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),

  body('email')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe contener al menos una letra mayúscula')
    .matches(/[a-z]/).withMessage('Debe contener al menos una letra minúscula')
    .matches(/[0-9]/).withMessage('Debe contener al menos un número'),
];

const loginValidators = [
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
];

// ── Rutas ────────────────────────────────────────────────────────────────────
router.post('/register', registerLimiter, registerValidators, handleValidationErrors, authCtrl.register);
router.post('/login',    loginLimiter,    loginValidators,    handleValidationErrors, authCtrl.login);
router.post('/logout',   authenticate, authCtrl.logout);
router.get('/me',        authenticate, authCtrl.me);

module.exports = router;
