'use strict';
const { Op } = require('sequelize');
const { Flight, User, Reservation, sequelize }  = require('../models');
const response          = require('../utils/response.helper');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de error
// ─────────────────────────────────────────────────────────────────────────────
function handleDbError(err, res, next) {
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
// Lista vuelos disponibles
// ─────────────────────────────────────────────────────────────────────────────
async function getFlights(req, res, next) {
  try {
    const flights = await Flight.findAll({
      where: {
        status: 'scheduled',
        availableSeats: { [Op.gt]: 0 },
        departureDatetime: { [Op.gt]: new Date() }
      },
      order: [['departureDatetime', 'ASC']]
    });
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
      origin: origin?.trim(),
      destination: destination?.trim(),
      departureDatetime,
      arrivalDatetime,
      price,
      totalSeats,
      availableSeats: totalSeats,   // Al crear, todos los asientos están disponibles
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

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Si se cambia totalSeats, necesitamos lógica adicional para availableSeats
    // Por simplicidad, aquí asumimos que el admin sabe lo que hace, 
    // pero idealmente deberíamos validar contra las reservas activas.
    if (updates.totalSeats !== undefined) {
      const seatsTaken = flight.totalSeats - flight.availableSeats;
      updates.availableSeats = updates.totalSeats - seatsTaken;
      if (updates.availableSeats < 0) {
        return response.error(res, 'El nuevo total de asientos no cubre las reservas existentes', 400);
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
// Cancela un vuelo y sus reservas asociadas
// ─────────────────────────────────────────────────────────────────────────────
async function cancelFlight(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const flight = await Flight.findByPk(req.params.id, { transaction });
    if (!flight) {
      await transaction.rollback();
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    if (flight.status === 'cancelled') {
      await transaction.rollback();
      return response.error(res, 'El vuelo ya está cancelado', 400);
    }

    // 1. Marcar vuelo como cancelado
    await flight.update({ status: 'cancelled' }, { transaction });

    // 2. Cancelar automáticamente todas las reservas asociadas que no estén ya canceladas
    await Reservation.update(
      { status: 'cancelled' },
      { 
        where: { flightId: flight.id, status: { [Op.ne]: 'cancelled' } },
        transaction 
      }
    );

    await transaction.commit();
    return response.success(res, null, 'Vuelo y reservas asociadas cancelados exitosamente');
  } catch (err) {
    await transaction.rollback();
    return handleDbError(err, res, next);
  }
}

module.exports = { getFlights, getFlightById, createFlight, updateFlight, cancelFlight };
