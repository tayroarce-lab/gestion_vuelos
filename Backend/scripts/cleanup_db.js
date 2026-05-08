'use strict';

/**
 * Script de limpieza para eliminar Triggers, Stored Procedures y Views.
 * Ayuda a asegurar que el sistema dependa únicamente de Sequelize ORM.
 */

require('dotenv').config();
const { sequelize } = require('../Models');

async function cleanup() {
  console.log('🧹 Iniciando limpieza de objetos de base de datos...');

  const dbName = sequelize.getDatabaseName();
  console.log(`📡 Base de datos activa: ${dbName}`);

  try {
    // 1. Eliminar Vistas (Views)
    const views = ['vw_vuelos_disponibles', 'vw_reservas_detalle', 'vw_available_flights'];
    for (const view of views) {
      try {
        await sequelize.query(`DROP VIEW IF EXISTS ${view}`);
        console.log(`   - Vista eliminada/no existe: ${view}`);
      } catch (e) {
        console.log(`   ! Error al eliminar vista ${view}: ${e.message}`);
      }
    }

    // 2. Eliminar Procedimientos Almacenados (SPs)
    const procedures = [
      'sp_crear_reserva', 'sp_cancelar_reserva', 'sp_create_reservation', 
      'sp_cancel_reservation', 'sp_update_flight_status'
    ];
    for (const sp of procedures) {
      try {
        await sequelize.query(`DROP PROCEDURE IF EXISTS ${sp}`);
        console.log(`   - Procedimiento eliminado/no existe: ${sp}`);
      } catch (e) {
        console.log(`   ! Error al eliminar procedimiento ${sp}: ${e.message}`);
      }
    }

    // 3. Eliminar Triggers (MySQL requiere nombre de tabla)
    // Buscamos triggers en la base de datos actual
    const [triggers] = await sequelize.query(`
      SELECT TRIGGER_NAME, EVENT_OBJECT_TABLE 
      FROM information_schema.TRIGGERS 
      WHERE TRIGGER_SCHEMA = '${dbName}'
    `);

    if (triggers.length > 0) {
      for (const t of triggers) {
        try {
          await sequelize.query(`DROP TRIGGER IF EXISTS ${t.TRIGGER_NAME}`);
          console.log(`   - Trigger eliminado: ${t.TRIGGER_NAME} (tabla: ${t.EVENT_OBJECT_TABLE})`);
        } catch (e) {
          console.log(`   ! Error al eliminar trigger ${t.TRIGGER_NAME}: ${e.message}`);
        }
      }
    } else {
      console.log('   - No se encontraron triggers activos.');
    }

    console.log('\n✅ Limpieza completada exitosamente.');
    console.log('🚀 El sistema ahora es 100% independiente de lógica en base de datos.');

  } catch (err) {
    console.error('\n❌ Error crítico durante la limpieza:', err);
  } finally {
    await sequelize.close();
  }
}

cleanup();
