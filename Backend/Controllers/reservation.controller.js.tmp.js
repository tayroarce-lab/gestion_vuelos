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
    const flight = await Flight.findByPk(flightId, { transaction, lock: transaction.LOCK.UPDATE });
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
    const takenSeats = await ReservationSeat.findAll({
      include: [{
        model: sequelize.models.Reservation,
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
      const takenIds = takenSeats.map(s => s.seatId);
      return response.error(res, `Los siguientes asientos ya no están disponibles: ${takenIds.join(', ')}`, 409);
    }

    // 4. Verificar cupo (aunque ya lo validamos por asientos, es bueno por integridad)
    if (flight.availableSeats < seatsReserved) {
      await transaction.rollback();
      return response.error(res, 'No hay suficientes asientos disponibles', 400);
    }

    // 5. Calcular precio total
    const totalPrice = parseFloat(flight.price) * seatsReserved;

    // 6. Crear la reserva
    const reservation = await Reservation.create({
      userId,
      flightId,
      seatsReserved,
      totalPrice,
      status: 'confirmed',
      reservationDate: new Date()
    }, { transaction });

    // 7. Vincular los asientos
    const reservationSeatsData = seatIds.map(seatId => ({
      reservationId: reservation.id,
      seatId
    }));
    
    await ReservationSeat.bulkCreate(reservationSeatsData, { transaction });

    // 8. Actualizar asientos disponibles en el vuelo
    flight.availableSeats -= seatsReserved;
    await flight.save({ transaction });

    await transaction.commit();

    return response.success(res, { 
      reservationId: reservation.id,
      message: 'Reserva creada exitosamente' 
    }, 'Reserva confirmada', 201);

  } catch (err) {
    if (transaction) await transaction.rollback();
    next(err);
  }
}
