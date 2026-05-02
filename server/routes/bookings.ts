import { Router } from 'express';
import { getBookings, getBookingById, updateBookingStatus, rescheduleBooking } from '../controllers/bookingController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, isOrganizer);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/reschedule', rescheduleBooking);

export default router;
