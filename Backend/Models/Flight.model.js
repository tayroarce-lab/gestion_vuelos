'use strict';
const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Flight extends Model {}

  Flight.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      flightNumber: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: { name: 'uq_flights_number', msg: 'El número de vuelo ya existe' },
        field: 'flight_number',
        validate: {
          notEmpty: { msg: 'El número de vuelo es requerido' },
          len: { args: [1, 10], msg: 'El número de vuelo no puede superar 10 caracteres' },
        },
      },
      origin: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El origen es requerido' },
        },
      },
      destination: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El destino es requerido' },
          isNotSameAsOrigin(value) {
            if (value.trim().toLowerCase() === this.origin.trim().toLowerCase()) {
              throw new Error('El origen y destino no pueden ser iguales');
            }
          },
        },
      },
      departureDatetime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'departure_datetime',
        validate: {
          isDate: { msg: 'La fecha de salida debe ser una fecha válida' },
          isFuture(value) {
            if (new Date(value) <= new Date()) {
              throw new Error('La fecha de salida debe ser futura');
            }
          },
        },
      },
      arrivalDatetime: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'arrival_datetime',
        validate: {
          isDate: { msg: 'La fecha de llegada debe ser una fecha válida' },
          isAfterDeparture(value) {
            if (new Date(value) <= new Date(this.departureDatetime)) {
              throw new Error('La llegada debe ser posterior a la salida');
            }
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: { msg: 'El precio debe ser un número' },
          min: { args: [0.01], msg: 'El precio debe ser mayor a 0' },
        },
      },
      totalSeats: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        field: 'total_seats',
        validate: {
          isInt: { msg: 'Total de asientos debe ser un entero' },
          min: { args: [1], msg: 'Debe haber al menos 1 asiento' },
          max: { args: [500], msg: 'No puede superar 500 asientos' },
        },
      },
      availableSeats: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
        field: 'available_seats',
        validate: {
          isInt: { msg: 'Asientos disponibles debe ser un entero' },
          min: { args: [0], msg: 'Los asientos disponibles no pueden ser negativos' },
        },
      },
      status: {
        type: DataTypes.ENUM('scheduled', 'delayed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'scheduled',
      },
      createdBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: 'created_by',
      },
    },
    {
      sequelize,
      modelName: 'Flight',
      tableName: 'flights',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Flight;
};
