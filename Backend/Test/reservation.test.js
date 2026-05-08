const request = require('supertest');
const app = require('../app');
const { User, Flight, Reservation } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Reservation Endpoints', () => {
  let client, admin, flight, clientCookie, adminCookie;

  beforeEach(async () => {
    await Reservation.destroy({ where: {} });
    await Flight.destroy({ where: {} });
    await User.destroy({ where: {} });

    client = await User.create({ name: 'Client', email: 'c@a.com', passwordHash: 'h', role: 'client' });
    admin  = await User.create({ name: 'Admin', email: 'a@a.com', passwordHash: 'h', role: 'admin' });
    
    const clientToken = jwt.sign({ id: client.id, role: client.role }, config.jwt.secret);
    const adminToken  = jwt.sign({ id: admin.id, role: admin.role }, config.jwt.secret);
    
    clientCookie = `${config.cookie.name}=${clientToken}`;
    adminCookie  = `${config.cookie.name}=${adminToken}`;

    flight = await Flight.create({
      flightNumber: 'RSV1', origin: 'MEX', destination: 'GUA',
      departureDatetime: new Date(Date.now() + 86400000),
      arrivalDatetime: new Date(Date.now() + 90000000),
      price: 100, totalSeats: 50, availableSeats: 50, createdBy: admin.id
    });
  });

  describe('Reglas de Reserva [Casos 11, 12, 13, 14]', () => {
    it('no debería permitir reservar si no hay asientos [Caso 11]', async () => {
      await flight.update({ availableSeats: 0 });
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ flightId: flight.id, seatsReserved: 1 });
      expect(res.statusCode).toEqual(400);
    });

    it('no debería permitir más de 9 asientos [Caso 12]', async () => {
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ flightId: flight.id, seatsReserved: 10 });
      expect(res.statusCode).toEqual(422);
    });

    it('no debería permitir dos reservas activas para el mismo vuelo [Caso 13]', async () => {
      await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 1, totalPrice: 100, status: 'pending' });
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ flightId: flight.id, seatsReserved: 1 });
      expect(res.statusCode).toEqual(409);
    });

    it('debería calcular correctamente el totalPrice [Caso 14]', async () => {
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ flightId: flight.id, seatsReserved: 3 });
      const r = await Reservation.findOne({ where: { flightId: flight.id } });
      expect(parseFloat(r.totalPrice)).toBe(300);
    });
  });

  describe('Integridad y Permisos [Casos 15, 17, 18]', () => {
    it('no debería permitir cancelar reserva ajena [Caso 15]', async () => {
      const other = await User.create({ name: 'Other', email: 'o@o.com', passwordHash: 'h', role: 'client' });
      const resv = await Reservation.create({ userId: other.id, flightId: flight.id, seatsReserved: 1, totalPrice: 100 });
      
      const res = await request(app).put(`/api/reservations/${resv.id}/cancel`).set('Cookie', clientCookie);
      expect(res.statusCode).toEqual(403);
    });

    it('debería devolver los asientos exactos al cancelar [Caso 17]', async () => {
      const resv = await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 5, totalPrice: 500 });
      await flight.update({ availableSeats: 45 });

      await request(app).put(`/api/reservations/${resv.id}/cancel`).set('Cookie', clientCookie);
      const f = await Flight.findByPk(flight.id);
      expect(f.availableSeats).toBe(50);
    });

    it('debería cancelar reservas en cascada si el vuelo se cancela [Caso 18]', async () => {
      const r1 = await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 1, totalPrice: 100 });
      
      await request(app).delete(`/api/flights/${flight.id}`).set('Cookie', adminCookie);
      
      const updatedR1 = await Reservation.findByPk(r1.id);
      expect(updatedR1.status).toBe('cancelled');
    });
  });
});
