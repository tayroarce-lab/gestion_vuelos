module.exports = {
  testEnvironment: 'node',
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/Test/setup.js'],
  clearMocks: true,
  testMatch: ['**/Test/**/*.test.js'],
};
