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
      password_hash: adminHash,
      role: 'admin',
      is_active: 1,
    },
    {
      name: 'Juan Pérez',
      email: 'juan@cliente.com',
      password_hash: clientHash,
      role: 'client',
      is_active: 1,
    },
    {
      name: 'María García',
      email: 'maria@cliente.com',
      password_hash: client2Hash,
      role: 'client',
      is_active: 1,
    },
  ], {
    // Pasar los campos en snake_case directamente porque usamos bulkCreate raw
    fields: ['name', 'email', 'password_hash', 'role', 'is_active'],
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
      flight_number: 'VL001',
      origin: 'Guatemala City',
      destination: 'Ciudad de México',
      departure_datetime: tomorrow,
      arrival_datetime: addHours(tomorrow, 3),
      price: 350.00,
      total_seats: 180,
      available_seats: 180,
      status: 'scheduled',
      created_by: adminUser.id,
    },
    {
      flight_number: 'VL002',
      origin: 'Guatemala City',
      destination: 'Miami',
      departure_datetime: in3days,
      arrival_datetime: addHours(in3days, 4),
      price: 520.50,
      total_seats: 200,
      available_seats: 200,
      status: 'scheduled',
      created_by: adminUser.id,
    },
    {
      flight_number: 'VL003',
      origin: 'Ciudad de México',
      destination: 'Bogotá',
      departure_datetime: in5days,
      arrival_datetime: addHours(in5days, 3.5),
      price: 410.00,
      total_seats: 150,
      available_seats: 150,
      status: 'scheduled',
      created_by: adminUser.id,
    },
    {
      flight_number: 'VL004',
      origin: 'Miami',
      destination: 'Guatemala City',
      departure_datetime: in7days,
      arrival_datetime: addHours(in7days, 4),
      price: 499.99,
      total_seats: 180,
      available_seats: 180,
      status: 'delayed',
      created_by: adminUser.id,
    },
  ], {
    fields: [
      'flight_number', 'origin', 'destination',
      'departure_datetime', 'arrival_datetime',
      'price', 'total_seats', 'available_seats',
      'status', 'created_by',
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
