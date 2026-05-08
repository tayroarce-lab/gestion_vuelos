'use strict';
const { Router } = require('express');
const { body, param } = require('express-validator');
const flightCtrl = require('../controllers/flight.controller');
const { authenticate }           = require('../middlewares/auth.middleware');
const { requireRole }            = require('../middlewares/role.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// ── Validaciones ──────────────────────────────────────────────────────────────
const flightValidators = [
  body('flightNumber')
    .trim()
    .notEmpty().withMessage('El número de vuelo es requerido')
    .isLength({ max: 10 }).withMessage('El número de vuelo no puede superar 10 caracteres'),

  body('origin')
    .trim()
    .notEmpty().withMessage('El origen es requerido'),

  body('destination')
    .trim()
    .notEmpty().withMessage('El destino es requerido')
    .custom((value, { req }) => {
      if (value.trim().toLowerCase() === req.body.origin?.trim().toLowerCase()) {
        throw new Error('El origen y destino no pueden ser iguales');
      }
      return true;
    }),

  body('departureDatetime')
    .isISO8601().withMessage('La fecha de salida debe ser una fecha ISO válida')
    .custom((value) => {
      if (new Date(value) <= new Date()) throw new Error('La fecha de salida debe ser futura');
      return true;
    }),

  body('arrivalDatetime')
    .isISO8601().withMessage('La fecha de llegada debe ser una fecha ISO válida')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.departureDatetime)) {
        throw new Error('La llegada debe ser posterior a la salida');
      }
      return true;
    }),

  body('price')
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),

  body('totalSeats')
    .isInt({ min: 1, max: 500 }).withMessage('Los asientos deben ser un entero entre 1 y 500'),

  body('airplaneId')
    .isInt({ gt: 0 }).withMessage('El ID del avión debe ser un entero positivo'),
];

// Validadores parciales para PUT (todos opcionales)
const flightUpdateValidators = [
  body('flightNumber').optional().trim().isLength({ max: 10 }).withMessage('Máximo 10 caracteres'),
  body('origin').optional().trim().notEmpty().withMessage('El origen no puede estar vacío'),
  body('destination').optional().trim().notEmpty().withMessage('El destino no puede estar vacío'),
  body('departureDatetime').optional().isISO8601().withMessage('Fecha ISO inválida'),
  body('arrivalDatetime').optional().isISO8601().withMessage('Fecha ISO inválida'),
  body('price').optional().isFloat({ gt: 0 }).withMessage('Precio debe ser mayor a 0'),
  body('totalSeats').optional().isInt({ min: 1, max: 500 }).withMessage('Entre 1 y 500'),
  body('airplaneId').optional().isInt({ gt: 0 }).withMessage('El ID del avión debe ser un entero positivo'),
  body('status')
    .optional()
    .isIn(['scheduled', 'delayed', 'cancelled', 'completed'])
    .withMessage('Estado inválido'),
];

const idParamValidator = [
  param('id').isInt({ gt: 0 }).withMessage('El ID debe ser un entero positivo'),
];

// ── Rutas ─────────────────────────────────────────────────────────────────────
// Públicas
router.get('/',    flightCtrl.getFlights);
router.get('/:id',       idParamValidator, handleValidationErrors, flightCtrl.getFlightById);
router.get('/:id/seats', idParamValidator, handleValidationErrors, flightCtrl.getFlightSeats);

// Solo admin
router.post('/',
  authenticate, requireRole('admin'),
  flightValidators, handleValidationErrors,
  flightCtrl.createFlight
);

router.put('/:id',
  authenticate, requireRole('admin'),
  [...idParamValidator, ...flightUpdateValidators], handleValidationErrors,
  flightCtrl.updateFlight
);

router.delete('/:id',
  authenticate, requireRole('admin'),
  idParamValidator, handleValidationErrors,
  flightCtrl.cancelFlight
);

module.exports = router;
