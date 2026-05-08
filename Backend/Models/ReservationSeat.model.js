'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ReservationSeat extends Model {}

  ReservationSeat.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      reservationId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'reservation_id',
      },
      seatId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'seat_id',
      },
    },
    {
      sequelize,
      modelName: 'ReservationSeat',
      tableName: 'reservation_seats',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['reservation_id', 'seat_id'],
        },
      ],
    }
  );

  return ReservationSeat;
};
