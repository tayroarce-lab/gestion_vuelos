'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  // ─────────────────────────────────────────────────────────────────────────
  // UP — Crea la tabla reservations
  // Depende de: users (FK user_id) y flights (FK flight_id)
  // ─────────────────────────────────────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('reservations', {
      id: {
        type:          Sequelize.INTEGER.UNSIGNED,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      user_id: {
        type:       Sequelize.INTEGER.UNSIGNED,
        allowNull:  false,
        comment:    'FK → users.id (cliente que realizó la reserva)',
        references: { model: 'users', key: 'id' },
        onDelete:   'RESTRICT',
        onUpdate:   'CASCADE',
      },
      flight_id: {
        type:       Sequelize.INTEGER.UNSIGNED,
        allowNull:  false,
        comment:    'FK → flights.id (vuelo reservado)',
        references: { model: 'flights', key: 'id' },
        onDelete:   'RESTRICT',
        onUpdate:   'CASCADE',
      },
      seats_reserved: {
        type:      Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
        comment:   'Cantidad de asientos reservados (1-9)',
      },
      total_price: {
        type:      Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment:   'Precio total = price × seats_reserved',
      },
      status: {
        type:         Sequelize.ENUM('pending', 'confirmed', 'cancelled'),
        allowNull:    false,
        defaultValue: 'pending',
        comment:      'Estado de la reserva',
      },
      reservation_date: {
        type:         Sequelize.DATE,
        allowNull:    false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment:      'Fecha y hora en que se realizó la reserva',
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
      comment: 'Reservas de vuelos realizadas por clientes',
    });

    // ── Unique composite: un usuario no puede reservar el mismo vuelo 2 veces
    await queryInterface.addIndex('reservations', ['user_id', 'flight_id'], {
      name:   'uq_reservations_user_flight',
      unique: true,
    });

    // ── Índices de performance para queries frecuentes ──────────────────────
    await queryInterface.addIndex('reservations', ['user_id'],          { name: 'idx_reservations_user_id' });
    await queryInterface.addIndex('reservations', ['flight_id'],        { name: 'idx_reservations_flight_id' });
    await queryInterface.addIndex('reservations', ['status'],           { name: 'idx_reservations_status' });
    await queryInterface.addIndex('reservations', ['reservation_date'], { name: 'idx_reservations_date' });

    // ── Check constraints de negocio (MySQL 8.0.16+) ───────────────────────
    await queryInterface.sequelize.query(`
      ALTER TABLE reservations
        ADD CONSTRAINT chk_reservations_seats
          CHECK (seats_reserved BETWEEN 1 AND 9),
        ADD CONSTRAINT chk_reservations_price
          CHECK (total_price > 0)
    `);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOWN — Elimina la tabla reservations
  // ─────────────────────────────────────────────────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('reservations');
  },
};
