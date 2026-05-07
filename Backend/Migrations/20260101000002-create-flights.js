'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  // ─────────────────────────────────────────────────────────────────────────
  // UP — Crea la tabla flights
  // Depende de: users (FK created_by)
  // ─────────────────────────────────────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('flights', {
      id: {
        type:          Sequelize.INTEGER.UNSIGNED,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      flight_number: {
        type:      Sequelize.STRING(10),
        allowNull: false,
        unique:    true,
        comment:   'Código único del vuelo (ej: VL001)',
      },
      origin: {
        type:      Sequelize.STRING(100),
        allowNull: false,
        comment:   'Ciudad/aeropuerto de origen',
      },
      destination: {
        type:      Sequelize.STRING(100),
        allowNull: false,
        comment:   'Ciudad/aeropuerto de destino — distinto de origin',
      },
      departure_datetime: {
        type:      Sequelize.DATE,
        allowNull: false,
        comment:   'Fecha y hora de salida',
      },
      arrival_datetime: {
        type:      Sequelize.DATE,
        allowNull: false,
        comment:   'Fecha y hora de llegada — debe ser posterior a departure',
      },
      price: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment:   'Precio por asiento en la moneda base',
      },
      total_seats: {
        type:      Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
        comment:   'Capacidad total del vuelo (1-500)',
      },
      available_seats: {
        type:      Sequelize.SMALLINT.UNSIGNED,
        allowNull: false,
        comment:   'Asientos aún disponibles para reservar',
      },
      status: {
        type:         Sequelize.ENUM('scheduled', 'delayed', 'cancelled', 'completed'),
        allowNull:    false,
        defaultValue: 'scheduled',
        comment:      'Estado actual del vuelo',
      },
      created_by: {
        type:       Sequelize.INTEGER.UNSIGNED,
        allowNull:  false,
        comment:    'FK → users.id (admin que creó el vuelo)',
        references: { model: 'users', key: 'id' },
        onDelete:   'RESTRICT',
        onUpdate:   'CASCADE',
      },
      created_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    }, {
      engine:  'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      comment: 'Vuelos disponibles gestionados por administradores',
    });

    // ── Índices de performance ──────────────────────────────────────────────
    await queryInterface.addIndex('flights', ['flight_number'],      { name: 'idx_flights_number',     unique: true });
    await queryInterface.addIndex('flights', ['departure_datetime'], { name: 'idx_flights_departure' });
    await queryInterface.addIndex('flights', ['status'],             { name: 'idx_flights_status' });
    await queryInterface.addIndex('flights', ['origin'],             { name: 'idx_flights_origin' });
    await queryInterface.addIndex('flights', ['destination'],        { name: 'idx_flights_dest' });
    await queryInterface.addIndex('flights', ['created_by'],         { name: 'idx_flights_created_by' });

    // ── Check constraints de negocio (MySQL 8.0.16+) ───────────────────────
    await queryInterface.sequelize.query(`
      ALTER TABLE flights
        ADD CONSTRAINT chk_flights_price
          CHECK (price > 0),
        ADD CONSTRAINT chk_flights_total_seats
          CHECK (total_seats > 0 AND total_seats <= 500),
        ADD CONSTRAINT chk_flights_avail_seats
          CHECK (available_seats <= total_seats),
        ADD CONSTRAINT chk_flights_dates
          CHECK (arrival_datetime > departure_datetime),
        ADD CONSTRAINT chk_flights_diff_cities
          CHECK (LOWER(TRIM(origin)) <> LOWER(TRIM(destination)))
    `);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOWN — Elimina la tabla flights
  // ─────────────────────────────────────────────────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('flights');
  },
};
