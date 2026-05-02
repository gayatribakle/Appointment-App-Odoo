import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createNotification } from '../services/notificationService.js';

// Initialize Razorpay conditionally
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export const createPaymentOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { booking_id } = req.body;
  if (!booking_id) { res.status(400).json({ error: 'booking_id is required' }); return; }

  const client = await pool.connect();
  try {
    const bookingRes = await client.query('SELECT b.*, s.advance_payment FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1 AND b.customer_id = $2', [booking_id, req.user!.id]);
    if (!bookingRes.rows.length) { res.status(404).json({ error: 'Booking not found' }); return; }
    
    const booking = bookingRes.rows[0];
    const amount = Number(booking.advance_payment);

    if (amount <= 0) {
      res.status(400).json({ error: 'No advance payment required for this booking' }); return;
    }

    let orderId = `mock_order_${Date.now()}`;

    if (razorpay) {
      const options = {
        amount: amount * 100, // Razorpay amount is in paise
        currency: 'INR',
        receipt: `receipt_order_${booking_id}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // Insert pending payment into DB
    const paymentRes = await client.query(
      `INSERT INTO payments (booking_id, amount, currency, status, gateway_order_id)
       VALUES ($1, $2, 'INR', 'pending', $3) RETURNING *`,
      [booking_id, amount, orderId]
    );

    res.json({
      order_id: orderId,
      amount: amount * 100,
      currency: 'INR',
      payment_id: paymentRes.rows[0].id,
      mock: !razorpay // Let frontend know if we are in mock mode
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch the payment
    const paymentRes = await client.query('SELECT * FROM payments WHERE id = $1 FOR UPDATE', [payment_id]);
    if (!paymentRes.rows.length) { res.status(404).json({ error: 'Payment not found' }); await client.query('ROLLBACK'); return; }
    
    const payment = paymentRes.rows[0];
    
    // Verify signature
    let isValid = false;
    
    if (razorpay) {
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest('hex');
      isValid = expectedSignature === razorpay_signature;
    } else {
      // Mock gateway accepts any string that starts with "mock_sig_"
      isValid = razorpay_signature?.startsWith('mock_sig_');
    }

    if (!isValid) {
      await client.query("UPDATE payments SET status = 'failed' WHERE id = $1", [payment_id]);
      await client.query('COMMIT');
      res.status(400).json({ error: 'Invalid payment signature' });
      return;
    }

    // Mark payment as paid
    await client.query(
      "UPDATE payments SET status = 'paid', transaction_id = $1, paid_at = NOW() WHERE id = $2",
      [razorpay_payment_id, payment_id]
    );

    // Mark booking as confirmed
    await client.query(
      "UPDATE bookings SET status = 'confirmed' WHERE id = $1",
      [payment.booking_id]
    );

    // Get booking details for notification
    const bookingRes = await client.query(`
      SELECT b.customer_id, b.service_id, s.title as service_title, s.organizer_id 
      FROM bookings b JOIN services s ON b.service_id = s.id WHERE b.id = $1
    `, [payment.booking_id]);
    const booking = bookingRes.rows[0];

    await client.query('COMMIT');

    // Notifications
    await createNotification(
      booking.customer_id,
      'Payment Successful',
      `Your payment of ₹${payment.amount} for "${booking.service_title}" was successful. Booking confirmed.`,
      'success'
    );
    await createNotification(
      booking.organizer_id,
      'Payment Received',
      `Payment of ₹${payment.amount} received for "${booking.service_title}". Booking confirmed.`,
      'success'
    );

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
};
