'use strict';
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Reservation extends Model {}

  Reservation.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'user_id',
      },
      flightId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'flight_id',
      },
      seatsReserved: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        field: 'seats_reserved',
        validate: {
          isInt: { msg: 'Los asientos reservados deben ser un entero' },
          min: { args: [1], msg: 'Debe reservar al menos 1 asiento' },
          max: { args: [9], msg: 'No puede reservar más de 9 asientos' },
        },
      },
      totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_price',
        validate: {
          isDecimal: { msg: 'El precio total debe ser un número' },
          min: { args: [0.01], msg: 'El precio total debe ser mayor a 0' },
        },
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
      },
      reservationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'reservation_date',
      },
    },
    {
      sequelize,
      modelName: 'Reservation',
      tableName: 'reservations',
      underscored: true,
      timestamps: true,

      indexes: [
        // La UNIQUE KEY (user_id, flight_id) ya existe en DB; solo documentamos
        { unique: true, fields: ['user_id', 'flight_id'], name: 'uq_reservations_user_flight' },
      ],
    }
  );

  return Reservation;
};
