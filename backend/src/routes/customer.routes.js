const express = require('express');
const { browseServices, bookAppointment, getMyBookings } = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

/**
 * @swagger
 * /customer/services:
 *   get:
 *     summary: Browse all services
 *     tags: [Customer]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query for service name
 *     responses:
 *       200:
 *         description: List of services
 */
router.get('/services', browseServices);

// Require auth for booking
router.use(authenticate);
router.use(authorizeRoles('CUSTOMER'));

/**
 * @swagger
 * /customer/bookings:
 *   post:
 *     summary: Book an appointment
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlot:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking request processed
 */
router.post('/bookings', bookAppointment);

/**
 * @swagger
 * /customer/bookings:
 *   get:
 *     summary: Get my bookings
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my bookings
 */
router.get('/bookings', getMyBookings);

module.exports = router;
