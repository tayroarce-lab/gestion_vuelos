'use strict';
const { sequelize } = require('../config/database');

// ── Importar modelos ────────────────────────────────────────────────────────
const User        = require('./User.model')(sequelize);
const Flight      = require('./Flight.model')(sequelize);
const Reservation = require('./Reservation.model')(sequelize);

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

// ── Exportar ────────────────────────────────────────────────────────────────
module.exports = { sequelize, User, Flight, Reservation };
