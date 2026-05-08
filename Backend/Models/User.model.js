'use strict';
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { bcrypt: bcryptConfig } = require('../config/config');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Verifica si la contraseña en texto plano coincide con el hash almacenado.
     * @param {string} plainPassword
     * @returns {Promise<boolean>}
     */
    async validatePassword(plainPassword) {
      return bcrypt.compare(plainPassword, this.passwordHash);
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'El nombre no puede estar vacío' },
          len: {
            args: [2, 100],
            msg: 'El nombre debe tener entre 2 y 100 caracteres',
          },
        },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: { name: 'uq_users_email', msg: 'El email ya está registrado' },
        validate: {
          isEmail: { msg: 'Debe ser un email válido' },
          notEmpty: { msg: 'El email no puede estar vacío' },
        },
      },
      // Campo en DB: password_hash (underscored: true lo mapea automáticamente)
      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.ENUM('admin', 'client'),
        allowNull: false,
        defaultValue: 'client',
      },
      isActive: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 1,
        field: 'is_active',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,

      // defaultScope: NUNCA retornar passwordHash en queries normales
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },

      // Scope especial para login (necesitamos el hash)
      scopes: {
        withPassword: { attributes: {} },
      },
    }
  );

  // ── Hook: hashear password antes de crear el usuario ──────────────────────
  User.addHook('beforeCreate', async (user) => {
    if (user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, bcryptConfig.saltRounds);
    }
  });

  // ── Hook: re-hashear si el password cambió en una actualización ───────────
  User.addHook('beforeUpdate', async (user) => {
    if (user.changed('passwordHash') && user.passwordHash) {
      user.passwordHash = await bcrypt.hash(user.passwordHash, bcryptConfig.saltRounds);
    }
  });

  return User;
};
