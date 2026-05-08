const request = require('supertest');
const app = require('../app');
const { User, Flight, Airplane } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Flight Endpoints', () => {
  let admin, adminCookie, airplane;

  beforeEach(async () => {
    await Flight.destroy({ where: {} });
    await Airplane.destroy({ where: {} });
    await User.destroy({ where: {} });

    admin = await User.create({ name: 'Admin', email: 'admin@a.com', passwordHash: 'hash', role: 'admin' });
    const token = jwt.sign({ id: admin.id, role: admin.role }, config.jwt.secret);
    adminCookie = `${config.cookie.name}=${token}`;

    airplane = await Airplane.create({ model: 'Test Plane', rows: 10, colsPerRow: 6 });
  });

  describe('Validaciones de Negocio [Casos 6, 7, 8, 9]', () => {
    it('no debería permitir crear un vuelo en el pasado [Caso 6]', async () => {
      const past = new Date(Date.now() - 86400000);
      const res = await request(app)
        .post('/api/flights')
        .set('Cookie', adminCookie)
        .send({
          flightNumber: 'PAST1', origin: 'MEX', destination: 'GUA',
          departureDatetime: past, arrivalDatetime: new Date(),
          price: 100, totalSeats: 50, airplaneId: airplane.id
        });
      expect(res.statusCode).toEqual(422);
    });

    it('no debería permitir llegada antes que salida [Caso 7]', async () => {
      const departure = new Date(Date.now() + 86400000);
      const arrival = new Date(Date.now() + 3600000); // 1h later, but departure is tomorrow
      const res = await request(app)
        .post('/api/flights')
        .set('Cookie', adminCookie)
        .send({
          flightNumber: 'ERR1', origin: 'MEX', destination: 'GUA',
          departureDatetime: departure, arrivalDatetime: arrival,
          price: 100, totalSeats: 50, airplaneId: airplane.id
        });
      expect(res.statusCode).toEqual(422);
    });

    it('no debería permitir origen y destino iguales [Caso 8]', async () => {
      const res = await request(app)
        .post('/api/flights')
        .set('Cookie', adminCookie)
        .send({
          flightNumber: 'SAME1', origin: 'MEX', destination: 'MEX',
          departureDatetime: new Date(Date.now() + 86400000), 
          arrivalDatetime: new Date(Date.now() + 90000000),
          price: 100, totalSeats: 50, airplaneId: airplane.id
        });
      expect(res.statusCode).toEqual(422);
    });

    it('no debería permitir números de vuelo duplicados [Caso 9]', async () => {
      await Flight.create({
        flightNumber: 'DUP1', origin: 'MEX', destination: 'GUA',
        departureDatetime: new Date(Date.now() + 86400000),
        arrivalDatetime: new Date(Date.now() + 90000000),
        price: 100, totalSeats: 50, availableSeats: 50, 
        airplaneId: airplane.id, createdBy: admin.id
      });

      const res = await request(app)
        .post('/api/flights')
        .set('Cookie', adminCookie)
        .send({
          flightNumber: 'DUP1', origin: 'MEX', destination: 'LAX',
          departureDatetime: new Date(Date.now() + 86400000),
          arrivalDatetime: new Date(Date.now() + 90000000),
          price: 200, totalSeats: 100, airplaneId: airplane.id
        });
      expect(res.statusCode).toEqual(409);
    });
  });

  describe('Control de Estados [Casos 10, 19]', () => {
    it('no debería permitir editar vuelos cancelados [Caso 10]', async () => {
      const flight = await Flight.create({
        flightNumber: 'CANC1', origin: 'MEX', destination: 'GUA',
        departureDatetime: new Date(Date.now() + 86400000),
        arrivalDatetime: new Date(Date.now() + 90000000),
        price: 100, totalSeats: 50, availableSeats: 50, 
        airplaneId: airplane.id, createdBy: admin.id,
        status: 'cancelled'
      });

      const res = await request(app)
        .put(`/api/flights/${flight.id}`)
        .set('Cookie', adminCookie)
        .send({ price: 200 });
      
      expect(res.statusCode).toEqual(400);
    });

    it('no debería listar vuelos cancelados para clientes [Caso 19]', async () => {
      await Flight.create({
        flightNumber: 'HIDDEN', origin: 'MEX', destination: 'GUA',
        departureDatetime: new Date(Date.now() + 86400000),
        arrivalDatetime: new Date(Date.now() + 90000000),
        price: 100, totalSeats: 50, availableSeats: 50, 
        airplaneId: airplane.id, createdBy: admin.id,
        status: 'cancelled'
      });

      const res = await request(app).get('/api/flights');
      expect(res.body.data.length).toBe(0);
    });
  });
});
