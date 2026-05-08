const { sequelize, Reservation, Flight, User, Seat, ReservationSeat } = require('../models');
const { Op } = require('sequelize');
const response = require('../utils/response.helper');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: captura errores MySQL
// ─────────────────────────────────────────────────────────────────────────────
function handleDbError(err, res, next) {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return response.error(res, 'Ya tienes una reserva para este vuelo', 409);
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return response.error(res, 'Referencia a datos inexistentes (ID inválido)', 400);
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
      include: [
        { model: Flight, as: 'flight' },
        { model: Seat, as: 'seats' }
      ],
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
        { model: Flight, as: 'flight' },
        { model: Seat, as: 'seats' }
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
// Crea una reserva con selección de asientos
// ─────────────────────────────────────────────────────────────────────────────
async function createReservation(req, res, next) {
  const transaction = await sequelize.transaction();
  try {
    const { flightId, seatIds } = req.body; 
    const userId = req.user.id;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      await transaction.rollback();
      return response.error(res, 'Debes seleccionar al menos un asiento', 400);
    }

    const seatsReserved = seatIds.length;

    // 1. Obtener vuelo y bloquearlo
    const flight = await Flight.findByPk(flightId, { 
      transaction, 
      lock: transaction.LOCK.UPDATE 
    });

    if (!flight) {
      await transaction.rollback();
      return response.error(res, 'Vuelo no encontrado', 404);
    }

    if (flight.status !== 'scheduled') {
      await transaction.rollback();
      return response.error(res, `No se puede reservar: el vuelo está ${flight.status}`, 400);
    }

    // 2. Verificar que los asientos existan y pertenezcan al avión del vuelo
    const validSeats = await Seat.findAll({
      where: { 
        id: { [Op.in]: seatIds },
        airplaneId: flight.airplaneId
      },
      transaction
    });

    if (validSeats.length !== seatIds.length) {
      await transaction.rollback();
      return response.error(res, 'Uno o más asientos seleccionados no son válidos para este avión', 400);
    }

    // 3. Verificar disponibilidad (solo en reservas activas para este vuelo)
    // Buscamos si alguno de los seatIds ya está en reservation_seats para este vuelo
    const takenSeats = await ReservationSeat.findAll({
      include: [{
        model: Reservation,
        as: 'reservation',
        where: {
          flightId,
          status: { [Op.ne]: 'cancelled' }
        },
        attributes: []
      }],
      where: {
        seatId: { [Op.in]: seatIds }
      },
      transaction
    });

    if (takenSeats.length > 0) {
      await transaction.rollback();
      return response.error(res, 'Uno o más asientos seleccionados ya están ocupados', 409);
    }

    // 4. Verificar si el usuario ya tiene reserva activa para este vuelo
    const existing = await Reservation.findOne({ 
      where: { userId, flightId, status: { [Op.ne]: 'cancelled' } }, 
      transaction 
    });
    
    if (existing) {
      await transaction.rollback();
      return response.error(res, 'Ya tienes una reserva activa para este vuelo', 409);
    }

    // 5. Verificar cupo (aunque ya lo validamos por asientos, es bueno por integridad)
    if (flight.availableSeats < seatsReserved) {
      await transaction.rollback();
      return response.error(res, 'No hay suficientes asientos disponibles en el vuelo', 400);
    }

    // 6. Calcular precio total y crear reserva
    const totalPrice = parseFloat(flight.price) * seatsReserved;
    const reservation = await Reservation.create({
      userId,
      flightId,
      seatsReserved,
      totalPrice,
      status: 'confirmed',
      reservationDate: new Date()
    }, { transaction });

    // 7. Vincular los asientos a la reserva
    const reservationSeatsData = seatIds.map(seatId => ({
      reservationId: reservation.id,
      seatId
    }));
    
    await ReservationSeat.bulkCreate(reservationSeatsData, { transaction });

    // 8. Actualizar asientos disponibles en el vuelo
    await flight.update({ 
      availableSeats: flight.availableSeats - seatsReserved 
    }, { transaction });

    await transaction.commit();

    return response.success(res, { 
      reservationId: reservation.id,
      message: 'Reserva creada exitosamente' 
    }, 'Reserva confirmada', 201);

  } catch (err) {
    if (transaction) await transaction.rollback();
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
    if (transaction) await transaction.rollback();
    return handleDbError(err, res, next);
  }
}

module.exports = {
  getMyReservations,
  getAllReservations,
  createReservation,
  cancelReservation,
};
