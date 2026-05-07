'use strict';
const { Sequelize } = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.pass,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'mysql',
    logging: config.isProduction ? false : (sql) => console.log(`[SQL] ${sql}`),
    timezone: '-06:00',          // Guatemala / Ciudad de México (ajusta si necesitas)
    define: {
      underscored: true,         // snake_case ↔ camelCase global
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30_000,
      idle: 10_000,
    },
    dialectOptions: {
      // Permite recibir DATETIME como objetos Date de JS
      dateStrings: false,
      typeCast: true,
    },
  }
);

/**
 * Verifica la conexión a la base de datos.
 * @returns {Promise<void>}
 */
async function connectDB() {
  await sequelize.authenticate();
  console.log('[DB] Conexión establecida con MySQL ✓');
}

module.exports = { sequelize, connectDB };
