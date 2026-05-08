'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Seat extends Model {}

  Seat.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      airplaneId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'airplane_id',
      },
      rowNumber: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        field: 'row_number',
      },
      columnLetter: {
        type: DataTypes.STRING(1),
        allowNull: false,
        field: 'column_letter',
      },
      type: {
        type: DataTypes.ENUM('economy', 'business'),
        defaultValue: 'economy',
      },
    },
    {
      sequelize,
      modelName: 'Seat',
      tableName: 'seats',
      underscored: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['airplane_id', 'row_number', 'column_letter'],
        },
      ],
    }
  );

  return Seat;
};
