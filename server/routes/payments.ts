import { Router } from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';

const router = Router();

router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);

export default router;
