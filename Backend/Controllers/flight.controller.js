'use strict';
const { QueryTypes }    = require('sequelize');
const { Flight, User }  = require('../models');
const { sequelize }     = require('../models');
const response          = require('../utils/response.helper');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de error MySQL
// ─────────────────────────────────────────────────────────────────────────────
function handleDbError(err, res, next) {
  // Triggers: SIGNAL SQLSTATE '45xxx'
  if (err.original?.sqlState?.startsWith('45')) {
    return response.error(res, err.original.sqlMessage, 400);
  }
  // Unique constraint (ej: flight_number duplicado)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return response.error(res, 'El número de vuelo ya existe', 409);
  }
  // Validaciones Sequelize (precio negativo, asientos, etc.)
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return response.error(res, 'Datos inválidos', 422, errors);
  }
  next(err);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/flights
// Lista vuelos disponibles desde la vista vw_available_flights
// ─────────────────────────────────────────────────────────────────────────────
async function getFlights(req, res, next) {
  try {
    const flights = await sequelize.query(
      'SELECT * FROM vw_available_flights',
      { type: QueryTypes.SELECT }
    );
    return response.success(res, flights, 'Vuelos disponibles');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/flights/:id
// Detalle de un vuelo específico
// ─────────────────────────────────────────────────────────────────────────────
async function getFlightById(req, res, next) {
  try {
    const flight = await Flight.findByPk(req.params.id, {
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }],
    });

    if (!flight) {
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    return response.success(res, flight, 'Detalle del vuelo');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/flights  [ADMIN]
// Crea un nuevo vuelo
// ─────────────────────────────────────────────────────────────────────────────
async function createFlight(req, res, next) {
  try {
    const {
      flightNumber, origin, destination,
      departureDatetime, arrivalDatetime,
      price, totalSeats,
    } = req.body;

    const flight = await Flight.create({
      flightNumber,
      origin: origin.trim(),
      destination: destination.trim(),
      departureDatetime,
      arrivalDatetime,
      price,
      totalSeats,
      availableSeats: totalSeats,   // al crear, todos los asientos están disponibles
      status: 'scheduled',
      createdBy: req.user.id,
    });

    return response.success(res, flight, 'Vuelo creado exitosamente', 201);
  } catch (err) {
    return handleDbError(err, res, next);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/flights/:id  [ADMIN]
// Actualiza un vuelo existente
// ─────────────────────────────────────────────────────────────────────────────
async function updateFlight(req, res, next) {
  try {
    const flight = await Flight.findByPk(req.params.id);
    if (!flight) {
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    // No permitir editar vuelos cancelados o completados
    if (['cancelled', 'completed'].includes(flight.status)) {
      return response.error(res, `No se puede modificar un vuelo en estado '${flight.status}'`, 400);
    }

    const allowed = [
      'flightNumber', 'origin', 'destination',
      'departureDatetime', 'arrivalDatetime',
      'price', 'totalSeats', 'status',
    ];

    // Solo actualizar campos permitidos que vengan en el body
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    await flight.update(updates);

    return response.success(res, flight, 'Vuelo actualizado exitosamente');
  } catch (err) {
    return handleDbError(err, res, next);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/flights/:id  [ADMIN]
// Soft delete: cambia status a 'cancelled'
// ─────────────────────────────────────────────────────────────────────────────
async function cancelFlight(req, res, next) {
  try {
    const flight = await Flight.findByPk(req.params.id);
    if (!flight) {
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    if (flight.status === 'cancelled') {
      return response.error(res, 'El vuelo ya está cancelado', 400);
    }

    await flight.update({ status: 'cancelled' });

    return response.success(res, null, 'Vuelo cancelado exitosamente');
  } catch (err) {
    return handleDbError(err, res, next);
  }
}

module.exports = { getFlights, getFlightById, createFlight, updateFlight, cancelFlight };
