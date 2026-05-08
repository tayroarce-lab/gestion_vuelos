'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Airplane extends Model {}

  Airplane.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      rows: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
      },
      colsPerRow: {
        type: DataTypes.TINYINT.UNSIGNED,
        allowNull: false,
        field: 'cols_per_row',
      },
    },
    {
      sequelize,
      modelName: 'Airplane',
      tableName: 'airplanes',
      underscored: true,
      timestamps: true,
    }
  );

  return Airplane;
};
