const express = require('express');
const { createService, getBookings, updateAvailability } = require('../controllers/organizer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('ORGANIZER'));

/**
 * @swagger
 * /organizer/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               duration:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created
 */
router.post('/services', createService);

/**
 * @swagger
 * /organizer/bookings:
 *   get:
 *     summary: Get all bookings for organizer's services
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 */
router.get('/bookings', getBookings);

/**
 * @swagger
 * /organizer/availability:
 *   put:
 *     summary: Update availability
 *     tags: [Organizer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               timeSlots:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Availability updated
 */
router.put('/availability', updateAvailability);

module.exports = router;
