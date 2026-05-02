import { Router } from 'express';
import { getDashboardStats, getCalendarEvents } from '../controllers/dashboardController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, isOrganizer);

router.get('/stats', getDashboardStats);
router.get('/calendar', getCalendarEvents);

export default router;
