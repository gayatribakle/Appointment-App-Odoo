import { Router } from 'express';
import {
  getAdminStats, getPendingServices, getAllServicesAdmin, approveService, rejectService,
  getAllUsers, updateUserStatus, updateUserRole,
  getAllBookingsAdmin, adminCancelBooking
} from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, isAdmin);

router.get('/stats', getAdminStats);
router.get('/services/pending', getPendingServices);
router.get('/services', getAllServicesAdmin);
router.patch('/services/:id/approve', approveService);
router.patch('/services/:id/reject', rejectService);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.patch('/users/:id/role', updateUserRole);
router.get('/bookings', getAllBookingsAdmin);
router.patch('/bookings/:id/cancel', adminCancelBooking);

export default router;
