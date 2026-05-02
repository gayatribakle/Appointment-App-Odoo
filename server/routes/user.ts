import { Router } from 'express';
import {
  getActiveServices, getServiceDetailPublic, getServiceByPrivateToken,
  createBooking, getMyBookings, cancelMyBooking, rescheduleMyBooking
} from '../controllers/userController.js';
import { verifyToken, isUser } from '../middleware/authMiddleware.js';

const router = Router();

// Public (no auth required for browsing)
router.get('/services', getActiveServices);
router.get('/services/shared/:token', getServiceByPrivateToken);
router.get('/services/:id', getServiceDetailPublic);

// Authenticated user routes
router.post('/bookings', verifyToken, isUser, createBooking);
router.get('/my-bookings', verifyToken, isUser, getMyBookings);
router.patch('/bookings/:id/cancel', verifyToken, isUser, cancelMyBooking);
router.patch('/bookings/:id/reschedule', verifyToken, isUser, rescheduleMyBooking);

export default router;
