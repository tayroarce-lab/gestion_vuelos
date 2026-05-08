const { sequelize } = require('../models');

beforeAll(async () => {
  // Asegurarnos que solo corremos en test
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests must run with NODE_ENV=test to avoid data loss');
  }
  
  // Sincronizar DB de test
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await sequelize.query('TRUNCATE TABLE reservations');
  await sequelize.query('TRUNCATE TABLE flights');
  await sequelize.query('TRUNCATE TABLE users');
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
});

afterAll(async () => {
  await sequelize.close();
});
