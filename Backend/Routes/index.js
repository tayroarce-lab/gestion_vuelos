'use strict';
const { Router } = require('express');

const authRoutes        = require('./auth.routes');
const flightRoutes      = require('./flight.routes');
const reservationRoutes = require('./reservation.routes');

const router = Router();

router.use('/auth',         authRoutes);
router.use('/flights',      flightRoutes);
router.use('/reservations', reservationRoutes);

module.exports = router;
