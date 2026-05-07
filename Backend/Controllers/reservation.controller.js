'use strict';
const { QueryTypes }  = require('sequelize');
const { sequelize }   = require('../models');
const response        = require('../utils/response.helper');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: captura errores MySQL de triggers y SPs
// ─────────────────────────────────────────────────────────────────────────────
function handleDbError(err, res, next) {
  if (err.original?.sqlState?.startsWith('45')) {
    return response.error(res, err.original.sqlMessage, 400);
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return response.error(res, 'Ya tienes una reserva para este vuelo', 409);
  }
  next(err);
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reservations  [CLIENT]
// Retorna las reservas del usuario autenticado via stored procedure
// ─────────────────────────────────────────────────────────────────────────────
async function getMyReservations(req, res, next) {
  try {
    const [reservations] = await sequelize.query(
      'CALL sp_get_user_reservations(:userId)',
      {
        replacements: { userId: req.user.id },
        type: QueryTypes.RAW,
      }
    );

    return response.success(res, reservations, 'Mis reservas');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/reservations/all  [ADMIN]
// Retorna todas las reservas con detalle via vista
// ─────────────────────────────────────────────────────────────────────────────
async function getAllReservations(req, res, next) {
  try {
    const reservations = await sequelize.query(
      'SELECT * FROM vw_reservations_detail',
      { type: QueryTypes.SELECT }
    );

    return response.success(res, reservations, 'Todas las reservas');
  } catch (err) {
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/reservations  [CLIENT]
// Crea una reserva via stored procedure
// ─────────────────────────────────────────────────────────────────────────────
async function createReservation(req, res, next) {
  try {
    const { flightId, seatsReserved } = req.body;
    const userId = req.user.id;

    // Llamar al stored procedure
    await sequelize.query(
      'CALL sp_create_reservation(:userId, :flightId, :seats, @resId, @msg)',
      {
        replacements: { userId, flightId, seats: seatsReserved },
        type: QueryTypes.RAW,
      }
    );

    // Recuperar variables OUT del SP
    const [[result]] = await sequelize.query(
      'SELECT @resId AS reservationId, @msg AS message',
      { type: QueryTypes.SELECT }
    );

    if (!result.reservationId) {
      // El SP retornó un mensaje de error de negocio
      return response.error(res, result.message || 'No se pudo crear la reserva', 400);
    }

    return response.success(
      res,
      { reservationId: result.reservationId, message: result.message },
      'Reserva creada exitosamente',
      201
    );
  } catch (err) {
    return handleDbError(err, res, next);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/reservations/:id/cancel  [CLIENT (dueño) o ADMIN]
// Cancela una reserva via stored procedure
// ─────────────────────────────────────────────────────────────────────────────
async function cancelReservation(req, res, next) {
  try {
    const reservationId = parseInt(req.params.id, 10);
    // Si es admin, puede cancelar cualquier reserva pasando su propio ID como override
    // El SP valida que el userId sea el dueño (excepto admin según la lógica del SP)
    const userId = req.user.id;

    await sequelize.query(
      'CALL sp_cancel_reservation(:reservationId, :userId, @success, @msg)',
      {
        replacements: { reservationId, userId },
        type: QueryTypes.RAW,
      }
    );

    const [[result]] = await sequelize.query(
      'SELECT @success AS success, @msg AS message',
      { type: QueryTypes.SELECT }
    );

    if (!result.success || result.success === 0) {
      return response.error(res, result.message || 'No se pudo cancelar la reserva', 400);
    }

    return response.success(res, null, result.message || 'Reserva cancelada exitosamente');
  } catch (err) {
    return handleDbError(err, res, next);
  }
}

module.exports = {
  getMyReservations,
  getAllReservations,
  createReservation,
  cancelReservation,
};
