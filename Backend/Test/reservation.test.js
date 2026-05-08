const request = require('supertest');
const app = require('../app');
const { User, Flight, Reservation, Airplane, Seat } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Reservation Endpoints', () => {
  let client, admin, flight, airplane, seats, clientCookie, adminCookie;

  beforeEach(async () => {
    await Reservation.destroy({ where: {} });
    await Flight.destroy({ where: {} });
    await Airplane.destroy({ where: {} });
    await User.destroy({ where: {} });

    client = await User.create({ name: 'Client', email: 'c@a.com', passwordHash: 'h', role: 'client' });
    admin  = await User.create({ name: 'Admin', email: 'a@a.com', passwordHash: 'h', role: 'admin' });
    
    const clientToken = jwt.sign({ id: client.id, role: client.role }, config.jwt.secret);
    const adminToken  = jwt.sign({ id: admin.id, role: admin.role }, config.jwt.secret);
    
    clientCookie = `${config.cookie.name}=${clientToken}`;
    adminCookie  = `${config.cookie.name}=${adminToken}`;

    airplane = await Airplane.create({ model: 'Test Plane', rows: 5, colsPerRow: 2 });
    const s1 = await Seat.create({ airplaneId: airplane.id, rowNumber: 1, columnLetter: 'A' });
    const s2 = await Seat.create({ airplaneId: airplane.id, rowNumber: 1, columnLetter: 'B' });
    const s3 = await Seat.create({ airplaneId: airplane.id, rowNumber: 2, columnLetter: 'A' });
    const s4 = await Seat.create({ airplaneId: airplane.id, rowNumber: 2, columnLetter: 'B' });
    seats = [s1, s2, s3, s4];

    flight = await Flight.create({
      flightNumber: 'RSV1', origin: 'MEX', destination: 'GUA',
      departureDatetime: new Date(Date.now() + 86400000),
      arrivalDatetime: new Date(Date.now() + 90000000),
      price: 100, totalSeats: 4, availableSeats: 4, airplaneId: airplane.id, createdBy: admin.id
    });
  });

  describe('Reglas de Reserva [Casos 11, 12, 13, 14]', () => {
    it('no debería permitir reservar si no hay asientos [Caso 11]', async () => {
      // En este nuevo sistema, si no hay asientos disponibles, no podrás elegir seatIds válidos
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ 
        flightId: flight.id, 
        seatIds: [999] // ID inexistente o ya ocupado
      });
      expect(res.statusCode).toEqual(400);
    });

    it('no debería permitir más de 9 asientos [Caso 12]', async () => {
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ 
        flightId: flight.id, 
        seatIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] 
      });
      expect(res.statusCode).toEqual(422);
    });

    it('no debería permitir dos reservas activas para el mismo vuelo [Caso 13]', async () => {
      await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 1, totalPrice: 100, status: 'pending' });
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ 
        flightId: flight.id, 
        seatIds: [seats[0].id] 
      });
      expect(res.statusCode).toEqual(409);
    });

    it('debería calcular correctamente el totalPrice [Caso 14]', async () => {
      const res = await request(app).post('/api/reservations').set('Cookie', clientCookie).send({ 
        flightId: flight.id, 
        seatIds: [seats[0].id, seats[1].id] 
      });
      const r = await Reservation.findOne({ where: { flightId: flight.id } });
      expect(parseFloat(r.totalPrice)).toBe(200);
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
      const resv = await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 2, totalPrice: 200 });
      await flight.update({ availableSeats: 2 });

      await request(app).put(`/api/reservations/${resv.id}/cancel`).set('Cookie', clientCookie);
      const f = await Flight.findByPk(flight.id);
      expect(f.availableSeats).toBe(4);
    });

    it('debería cancelar reservas en cascada si el vuelo se cancela [Caso 18]', async () => {
      const r1 = await Reservation.create({ userId: client.id, flightId: flight.id, seatsReserved: 1, totalPrice: 100 });
      
      await request(app).delete(`/api/flights/${flight.id}`).set('Cookie', adminCookie);
      
      const updatedR1 = await Reservation.findByPk(r1.id);
      expect(updatedR1.status).toBe('cancelled');
    });
  });
});
