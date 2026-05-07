'use strict';
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  // ─────────────────────────────────────────────────────────────────────────
  // UP — Crea la tabla users
  // ─────────────────────────────────────────────────────────────────────────
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type:          Sequelize.INTEGER.UNSIGNED,
        primaryKey:    true,
        autoIncrement: true,
        allowNull:     false,
      },
      name: {
        type:      Sequelize.STRING(100),
        allowNull: false,
        comment:   'Nombre completo del usuario',
      },
      email: {
        type:      Sequelize.STRING(150),
        allowNull: false,
        unique:    true,
        comment:   'Email único — usado para autenticación',
      },
      password_hash: {
        type:      Sequelize.STRING(255),
        allowNull: false,
        comment:   'Hash bcrypt de la contraseña (saltRounds: 12)',
      },
      role: {
        type:         Sequelize.ENUM('admin', 'client'),
        allowNull:    false,
        defaultValue: 'client',
        comment:      'Rol del usuario — determina permisos en la API',
      },
      is_active: {
        type:         Sequelize.TINYINT,
        allowNull:    false,
        defaultValue: 1,
        comment:      '1 = activo, 0 = desactivado (soft delete)',
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
      comment: 'Usuarios del sistema (admins y clientes)',
    });

    // ── Índices de performance ──────────────────────────────────────────────
    await queryInterface.addIndex('users', ['email'],     { name: 'idx_users_email',     unique: true });
    await queryInterface.addIndex('users', ['role'],      { name: 'idx_users_role' });
    await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' });

    // ── Check constraints (requieren MySQL 8.0.16+) ─────────────────────────
    await queryInterface.sequelize.query(`
      ALTER TABLE users
        ADD CONSTRAINT chk_users_name_length
          CHECK (CHAR_LENGTH(TRIM(name)) >= 2)
    `);
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOWN — Elimina la tabla users
  // ─────────────────────────────────────────────────────────────────────────
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
