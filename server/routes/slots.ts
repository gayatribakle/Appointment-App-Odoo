import { Router } from 'express';
import { generateSlots, getAvailableSlots, getAllSlots } from '../controllers/slotController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, isOrganizer);

router.post('/generate', generateSlots);
router.get('/available', getAvailableSlots);
router.get('/', getAllSlots);

export default router;
