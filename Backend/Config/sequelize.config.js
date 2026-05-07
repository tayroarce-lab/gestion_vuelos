// Configuración de Sequelize CLI
// Las credenciales reales se leen desde .env vía config/config.js
require('dotenv').config();
const cfg = require('./config');

module.exports = {
  development: {
    username: cfg.db.user,
    password: cfg.db.pass,
    database: cfg.db.name,
    host:     cfg.db.host,
    port:     cfg.db.port,
    dialect:  'mysql',
    timezone: '-06:00',
    define: {
      underscored: true,
      timestamps:  true,
      createdAt:   'created_at',
      updatedAt:   'updated_at',
    },
  },
  test: {
    username: cfg.db.user,
    password: cfg.db.pass,
    database: cfg.db.name + '_test',
    host:     cfg.db.host,
    port:     cfg.db.port,
    dialect:  'mysql',
  },
  production: {
    username: cfg.db.user,
    password: cfg.db.pass,
    database: cfg.db.name,
    host:     cfg.db.host,
    port:     cfg.db.port,
    dialect:  'mysql',
    logging:  false,
  },
};
