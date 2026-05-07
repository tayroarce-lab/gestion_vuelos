'use strict';
const { Router } = require('express');
const { body, param } = require('express-validator');
const reservationCtrl = require('../controllers/reservation.controller');
const { authenticate }           = require('../middlewares/auth.middleware');
const { requireRole }            = require('../middlewares/role.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// ── Validaciones ──────────────────────────────────────────────────────────────
const createReservationValidators = [
  body('flightId')
    .isInt({ gt: 0 }).withMessage('El ID del vuelo debe ser un entero positivo'),

  body('seatsReserved')
    .isInt({ min: 1, max: 9 }).withMessage('Debe reservar entre 1 y 9 asientos'),
];

const idParamValidator = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
];

// ── Rutas ─────────────────────────────────────────────────────────────────────

// GET /api/reservations       — cliente: mis reservas
router.get('/',
  authenticate, requireRole('client'),
  reservationCtrl.getMyReservations
);

// GET /api/reservations/all   — admin: todas las reservas
// IMPORTANTE: esta ruta debe ir ANTES de /:id para evitar conflictos
router.get('/all',
  authenticate, requireRole('admin'),
  reservationCtrl.getAllReservations
);

// POST /api/reservations      — cliente: crear reserva
router.post('/',
  authenticate, requireRole('client'),
  createReservationValidators, handleValidationErrors,
  reservationCtrl.createReservation
);

// PUT /api/reservations/:id/cancel — cliente (dueño) o admin
router.put('/:id/cancel',
  authenticate, requireRole('client', 'admin'),
  idParamValidator, handleValidationErrors,
  reservationCtrl.cancelReservation
);

module.exports = router;
