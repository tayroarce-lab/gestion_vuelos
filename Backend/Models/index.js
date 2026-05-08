'use strict';
const { sequelize } = require('../config/database');

// ── Importar modelos ────────────────────────────────────────────────────────
const User            = require('./User.model')(sequelize);
const Flight          = require('./Flight.model')(sequelize);
const Reservation     = require('./Reservation.model')(sequelize);
const Airplane        = require('./Airplane.model')(sequelize);
const Seat            = require('./Seat.model')(sequelize);
const ReservationSeat = require('./ReservationSeat.model')(sequelize);

// ── Asociaciones ────────────────────────────────────────────────────────────

// Un admin crea muchos vuelos
User.hasMany(Flight, {
  as: 'createdFlights',
  foreignKey: { name: 'createdBy', field: 'created_by' },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Flight.belongsTo(User, {
  as: 'creator',
  foreignKey: { name: 'createdBy', field: 'created_by' },
});

// Un cliente tiene muchas reservas
User.hasMany(Reservation, {
  as: 'reservations',
  foreignKey: { name: 'userId', field: 'user_id' },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Reservation.belongsTo(User, {
  as: 'user',
  foreignKey: { name: 'userId', field: 'user_id' },
});

// Un vuelo tiene muchas reservas
Flight.hasMany(Reservation, {
  as: 'reservations',
  foreignKey: { name: 'flightId', field: 'flight_id' },
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Reservation.belongsTo(Flight, {
  as: 'flight',
  foreignKey: { name: 'flightId', field: 'flight_id' },
});

// Avión y Asientos
Airplane.hasMany(Seat, {
  as: 'seats',
  foreignKey: { name: 'airplaneId', field: 'airplane_id' },
  onDelete: 'CASCADE',
});
Seat.belongsTo(Airplane, {
  as: 'airplane',
  foreignKey: { name: 'airplaneId', field: 'airplane_id' },
});

// Avión y Vuelos
Airplane.hasMany(Flight, {
  as: 'flights',
  foreignKey: { name: 'airplaneId', field: 'airplane_id' },
  onDelete: 'RESTRICT',
});
Flight.belongsTo(Airplane, {
  as: 'airplane',
  foreignKey: { name: 'airplaneId', field: 'airplane_id' },
});

// Reservas y Asientos (Many-to-Many)
Reservation.belongsToMany(Seat, {
  through: ReservationSeat,
  as: 'seats',
  foreignKey: 'reservation_id',
  otherKey: 'seat_id',
});
Seat.belongsToMany(Reservation, {
  through: ReservationSeat,
  as: 'reservations',
  foreignKey: 'seat_id',
  otherKey: 'reservation_id',
});

// Asociaciones directas para la tabla intermedia (necesarias para includes)
ReservationSeat.belongsTo(Reservation, { as: 'reservation', foreignKey: 'reservation_id' });
ReservationSeat.belongsTo(Seat, { as: 'seat', foreignKey: 'seat_id' });
Reservation.hasMany(ReservationSeat, { as: 'reservationSeats', foreignKey: 'reservation_id' });
Seat.hasMany(ReservationSeat, { as: 'seatReservations', foreignKey: 'seat_id' });

// ── Exportar ────────────────────────────────────────────────────────────────
module.exports = { 
  sequelize, 
  User, 
  Flight, 
  Reservation, 
  Airplane, 
  Seat, 
  ReservationSeat 
};
