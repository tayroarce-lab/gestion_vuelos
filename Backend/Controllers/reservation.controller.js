'use strict';
const { sequelize, Reservation, Flight, User } = require('../models');
const response = require('../utils/response.helper');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: captura errores MySQL
// ─────────────────────────────────────────────────────────────────────────────
function handleDbError(err, res, next) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return response.error(res, 'Ya tienes una reserva para este vuelo', 409);
  }
  next(err);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reservations  [CLIENT]
// Retorna las reservas del usuario autenticado
// ─────────────────────────────────────────────────────────────────────────────
async function getMyReservations(req, res, next) {
  try {
    const reservations = await Reservation.findAll({
      where: { userId: req.user.id },
      include: [{ model: Flight, as: 'flight' }],
      order: [['reservationDate', 'DESC']],
    });

    return response.success(res, reservations, 'Mis reservas');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reservations/all  [ADMIN]
// Retorna todas las reservas con detalle
// ─────────────────────────────────────────────────────────────────────────────
async function getAllReservations(req, res, next) {
  try {
    const reservations = await Reservation.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Flight, as: 'flight' }
      ],
      order: [['reservationDate', 'DESC']],
    });

    return response.success(res, reservations, 'Todas las reservas');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reservations  [CLIENT]
// Crea una reserva
// ─────────────────────────────────────────────────────────────────────────────
async function createReservation(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { flightId, seatsReserved } = req.body;
    const userId = req.user.id;

    // 1. Obtener vuelo y bloquearlo para actualización (pesimista) para prevenir race conditions
    const flight = await Flight.findByPk(flightId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!flight) {
      await transaction.rollback();
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    if (flight.status !== 'scheduled') {
      await transaction.rollback();
      return response.error(res, `No se puede reservar: el vuelo está ${flight.status}`, 400);
    }

    if (flight.availableSeats < seatsReserved) {
      await transaction.rollback();
      return response.error(res, 'No hay suficientes asientos disponibles', 400);
    }

    // 2. Verificar si el usuario ya tiene reserva (la BD lo bloquearía por UNIQUE, pero es mejor verificar)
    const existing = await Reservation.findOne({ where: { userId, flightId }, transaction });
    if (existing && existing.status !== 'cancelled') {
      await transaction.rollback();
      return response.error(res, 'Ya tienes una reserva activa para este vuelo', 409);
    }

    // 3. Crear reserva
    const totalPrice = parseFloat(flight.price) * seatsReserved;
    const reservation = await Reservation.create({
      userId,
      flightId,
      seatsReserved,
      totalPrice,
      status: 'pending',
    }, { transaction });

    // 4. Actualizar asientos del vuelo
    await flight.update({ availableSeats: flight.availableSeats - seatsReserved }, { transaction });

    await transaction.commit();

    return response.success(
      res,
      { reservationId: reservation.id },
      'Reserva creada exitosamente',
      201
    );
  } catch (err) {
    await transaction.rollback();
    return handleDbError(err, res, next);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/reservations/:id/cancel  [CLIENT (dueño) o ADMIN]
// Cancela una reserva
// ─────────────────────────────────────────────────────────────────────────────
async function cancelReservation(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const reservationId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Obtener reserva
    const reservation = await Reservation.findByPk(reservationId, { transaction });
    if (!reservation) {
      await transaction.rollback();
      return response.error(res, 'Reserva no encontrada', 404);
    }

    // 2. Verificar permisos
    if (!isAdmin && reservation.userId !== userId) {
      await transaction.rollback();
      return response.error(res, 'No tienes permiso para cancelar esta reserva', 403);
    }

    if (reservation.status === 'cancelled') {
      await transaction.rollback();
      return response.error(res, 'La reserva ya está cancelada', 400);
    }

    // 3. Obtener vuelo
    const flight = await Flight.findByPk(reservation.flightId, { transaction, lock: transaction.LOCK.UPDATE });

    // 4. Actualizar estado y asientos
    await reservation.update({ status: 'cancelled' }, { transaction });
    if (flight) {
      await flight.update({ availableSeats: flight.availableSeats + reservation.seatsReserved }, { transaction });
    }

    await transaction.commit();

    return response.success(res, null, 'Reserva cancelada exitosamente');
  } catch (err) {
    await transaction.rollback();
    return handleDbError(err, res, next);
  }
}

module.exports = {
  getMyReservations,
  getAllReservations,
  createReservation,
  cancelReservation,
};
