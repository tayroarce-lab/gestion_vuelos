'use strict';
require('dotenv').config();

const app             = require('./app');
const { connectDB }   = require('./config/database');
const { sequelize }   = require('./models');
const config          = require('./config/config');

async function startServer() {
  try {
    // 1. Verificar conexión a MySQL
    await connectDB();

    // 2. Sincronizar modelos con la DB
    //    alter: false + force: false → NUNCA modifica tablas existentes en producción
    //    Solo crea tablas que no existen aún.
    await sequelize.sync({ force: false, alter: false });
    console.log('[DB] Modelos sincronizados ✓');

    // 3. Validar JWT_SECRET
    if (!config.jwt.secret || config.jwt.secret.length < 32) {
      throw new Error('JWT_SECRET no está configurado o es demasiado corto (mínimo 32 chars)');
    }

    // 4. Levantar el servidor HTTP
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📋 Entorno: ${config.nodeEnv}`);
      console.log(`🔗 Frontend permitido: ${config.frontendUrl}`);
      console.log(`\n📡 Endpoints disponibles:`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
      console.log(`   POST   http://localhost:${PORT}/api/auth/logout`);
      console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
      console.log(`   GET    http://localhost:${PORT}/api/flights`);
      console.log(`   GET    http://localhost:${PORT}/api/flights/:id`);
      console.log(`   POST   http://localhost:${PORT}/api/flights`);
      console.log(`   PUT    http://localhost:${PORT}/api/flights/:id`);
      console.log(`   DELETE http://localhost:${PORT}/api/flights/:id`);
      console.log(`   GET    http://localhost:${PORT}/api/reservations`);
      console.log(`   GET    http://localhost:${PORT}/api/reservations/all`);
      console.log(`   POST   http://localhost:${PORT}/api/reservations`);
      console.log(`   PUT    http://localhost:${PORT}/api/reservations/:id/cancel`);
    });

  } catch (error) {
    console.error('[FATAL] No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('[SERVER] SIGTERM recibido. Cerrando conexiones...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[SERVER] SIGINT recibido. Cerrando conexiones...');
  await sequelize.close();
  process.exit(0);
});

startServer();
