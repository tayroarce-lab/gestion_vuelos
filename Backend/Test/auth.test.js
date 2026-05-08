const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo cliente [Caso 1: Básico]', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!',
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('no debería permitir emails duplicados [Caso 1: Duplicados]', async () => {
      await User.create({ name: 'User A', email: 'dup@example.com', passwordHash: 'hash', role: 'client' });
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User B', email: 'dup@example.com', password: 'Password123!' });
      
      expect(res.statusCode).toEqual(409);
    });

    it('debería rechazar contraseñas cortas [Caso 2: Robustez]', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'short@ex.com', password: '123' });
      
      expect(res.statusCode).toEqual(422);
      expect(res.body.errors[0].message).toContain('8 caracteres');
    });
  });

  describe('Protección de Rutas [Casos 3, 4, 5]', () => {
    it('debería denegar acceso sin token [Caso 3]', async () => {
      const res = await request(app).get('/api/reservations'); // Ruta protegida
      expect(res.statusCode).toEqual(401);
    });

    it('debería denegar acceso a rutas de admin para clientes [Caso 4]', async () => {
      const user = await User.create({ name: 'Client', email: 'c@c.com', passwordHash: 'h', role: 'client' });
      const token = jwt.sign({ id: user.id, role: user.role }, config.jwt.secret);
      
      const res = await request(app)
        .post('/api/flights')
        .set('Cookie', `${config.cookie.name}=${token}`)
        .send({});
      
      expect(res.statusCode).toEqual(403);
    });

    it('debería denegar acceso con token inválido [Caso 5]', async () => {
      const res = await request(app)
        .get('/api/reservations')
        .set('Cookie', `${config.cookie.name}=token-falso`);
      
      expect(res.statusCode).toEqual(401);
    });
  });
});
