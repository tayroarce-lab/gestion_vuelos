'use strict';

/**
 * Seed inicial — SOLO para ambiente de desarrollo.
 * ⚠️  USA force: true — BORRA Y RECREA TODAS LAS TABLAS.
 * Ejecutar: npm run seed
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const bcrypt      = require('bcryptjs');
const { sequelize, User, Flight, Reservation } = require('../models');

const SALT_ROUNDS = 12;

async function seed() {
  console.log('⚠️  SEED: Eliminando y recreando tablas...');

  // Recrear tablas — BORRA todos los datos existentes
  await sequelize.sync({ force: true });
  console.log('✓ Tablas recreadas');

  // ── Usuarios ──────────────────────────────────────────────────────────────
  const adminHash  = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const clientHash = await bcrypt.hash('Client123!', SALT_ROUNDS);
  const client2Hash = await bcrypt.hash('Maria456!', SALT_ROUNDS);

  // Insertar directamente (sin el hook para evitar doble hasheo)
  const [admin] = await User.unscoped().bulkCreate([
    {
      name: 'Administrador Sistema',
      email: 'admin@vuelos.com',
      passwordHash: adminHash,
      role: 'admin',
      isActive: 1,
    },
    {
      name: 'Juan Pérez',
      email: 'juan@cliente.com',
      passwordHash: clientHash,
      role: 'client',
      isActive: 1,
    },
    {
      name: 'María García',
      email: 'maria@cliente.com',
      passwordHash: client2Hash,
      role: 'client',
      isActive: 1,
    },
  ], {
    // Pasar los campos en camelCase como los espera Sequelize (underscored maneja el mapeo)
    fields: ['name', 'email', 'passwordHash', 'role', 'isActive'],
    hooks: false,          // Evitar doble hasheo (ya hasheamos arriba)
  });

  // Re-obtener admin con su ID real
  const adminUser = await User.unscoped().findOne({ where: { email: 'admin@vuelos.com' } });
  console.log(`✓ Usuarios creados (admin id=${adminUser.id})`);

  // ── Vuelos ────────────────────────────────────────────────────────────────
  const tomorrow    = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const in3days     = new Date(Date.now() + 3  * 24 * 60 * 60 * 1000);
  const in5days     = new Date(Date.now() + 5  * 24 * 60 * 60 * 1000);
  const in7days     = new Date(Date.now() + 7  * 24 * 60 * 60 * 1000);

  const addHours = (date, hours) => new Date(date.getTime() + hours * 60 * 60 * 1000);

  await Flight.bulkCreate([
    {
      flightNumber: 'VL001',
      origin: 'Guatemala City',
      destination: 'Ciudad de México',
      departureDatetime: tomorrow,
      arrivalDatetime: addHours(tomorrow, 3),
      price: 350.00,
      totalSeats: 180,
      availableSeats: 180,
      status: 'scheduled',
      createdBy: adminUser.id,
    },
    {
      flightNumber: 'VL002',
      origin: 'Guatemala City',
      destination: 'Miami',
      departureDatetime: in3days,
      arrivalDatetime: addHours(in3days, 4),
      price: 520.50,
      totalSeats: 200,
      availableSeats: 200,
      status: 'scheduled',
      createdBy: adminUser.id,
    },
    {
      flightNumber: 'VL003',
      origin: 'Ciudad de México',
      destination: 'Bogotá',
      departureDatetime: in5days,
      arrivalDatetime: addHours(in5days, 3.5),
      price: 410.00,
      totalSeats: 150,
      availableSeats: 150,
      status: 'scheduled',
      createdBy: adminUser.id,
    },
    {
      flightNumber: 'VL004',
      origin: 'Miami',
      destination: 'Guatemala City',
      departureDatetime: in7days,
      arrivalDatetime: addHours(in7days, 4),
      price: 499.99,
      totalSeats: 180,
      availableSeats: 180,
      status: 'delayed',
      createdBy: adminUser.id,
    },
  ], {
    fields: [
      'flightNumber', 'origin', 'destination',
      'departureDatetime', 'arrivalDatetime',
      'price', 'totalSeats', 'availableSeats',
      'status', 'createdBy',
    ],
  });

  console.log('✓ Vuelos demo creados');

  console.log('\n════════════════════════════════════════════');
  console.log('✅ Seed completado exitosamente');
  console.log('════════════════════════════════════════════');
  console.log('\nCredenciales de prueba:');
  console.log('  Admin   → admin@vuelos.com     / Admin123!');
  console.log('  Cliente → juan@cliente.com     / Client123!');
  console.log('  Cliente → maria@cliente.com    / Maria456!');
  console.log('════════════════════════════════════════════\n');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
