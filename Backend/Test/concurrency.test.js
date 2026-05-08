const request = require('supertest');
const app = require('../app');
const { User, Flight, Reservation } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

describe('Concurrency / Race Conditions [Caso 16]', () => {
  let admin, flight, users, cookies;

  beforeEach(async () => {
    // Los destroy y truncates ya se hacen en setup.js beforeEach

    // Crear admin y vuelo con 1 solo asiento disponible
    admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash: 'h', role: 'admin' });
    flight = await Flight.create({
      flightNumber: 'RACE1', origin: 'MEX', destination: 'GUA',
      departureDatetime: new Date(Date.now() + 86400000),
      arrivalDatetime: new Date(Date.now() + 90000000),
      price: 100, totalSeats: 10, availableSeats: 1, createdBy: admin.id
    });

    // Crear 5 usuarios diferentes para intentar reservar al mismo tiempo
    users = await Promise.all([
      User.create({ name: 'U1', email: 'u1@t.com', passwordHash: 'h', role: 'client' }),
      User.create({ name: 'U2', email: 'u2@t.com', passwordHash: 'h', role: 'client' }),
      User.create({ name: 'U3', email: 'u3@t.com', passwordHash: 'h', role: 'client' }),
      User.create({ name: 'U4', email: 'u4@t.com', passwordHash: 'h', role: 'client' }),
      User.create({ name: 'U5', email: 'u5@t.com', passwordHash: 'h', role: 'client' }),
    ]);

    cookies = users.map(u => {
      const token = jwt.sign({ id: u.id, role: u.role }, config.jwt.secret);
      return `${config.cookie.name}=${token}`;
    });
  });

  it('solo 1 usuario debería lograr reservar el último asiento disponible [Caso 16]', async () => {
    // Lanzar 5 peticiones simultáneas
    const results = await Promise.all(
      cookies.map(cookie => 
        request(app)
          .post('/api/reservations')
          .set('Cookie', cookie)
          .send({ flightId: flight.id, seatsReserved: 1 })
      )
    );

    // Contar cuántos tuvieron éxito (201) y cuántos fallaron (400)
    const successCount = results.filter(r => r.statusCode === 201).length;
    const failureCount = results.filter(r => r.statusCode === 400).length;

    // Verificar que solo 1 tuvo éxito
    expect(successCount).toBe(1);
    expect(failureCount).toBe(4);

    // Verificar que el vuelo quedó con 0 asientos
    const updatedFlight = await Flight.findByPk(flight.id);
    expect(updatedFlight.availableSeats).toBe(0);

    // Verificar que solo hay 1 reserva en la base de datos
    const reservationCount = await Reservation.count({ where: { flightId: flight.id } });
    expect(reservationCount).toBe(1);
  });
});
