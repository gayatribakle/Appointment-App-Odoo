import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { createNotification } from '../services/notificationService.js';

export const getBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, service_id, from, to } = req.query;
  try {
    let query = `
      SELECT b.*, s.title as service_title, sl.slot_date, sl.start_time, sl.end_time,
             p.amount as payment_amount, p.status as payment_status
      FROM bookings b
      JOIN slots sl ON b.slot_id = sl.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE s.organizer_id = $1`;
    const params: any[] = [req.user!.id];
    if (status) { params.push(status); query += ` AND b.status=$${params.length}`; }
    if (service_id) { params.push(service_id); query += ` AND b.service_id=$${params.length}`; }
    if (from) { params.push(from); query += ` AND sl.slot_date>=$${params.length}`; }
    if (to) { params.push(to); query += ` AND sl.slot_date<=$${params.length}`; }
    query += ' ORDER BY sl.slot_date DESC, sl.start_time DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT b.*, s.title as service_title, sl.slot_date, sl.start_time, sl.end_time,
             p.amount as payment_amount, p.status as payment_status, p.transaction_id
      FROM bookings b
      JOIN slots sl ON b.slot_id = sl.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN payments p ON p.booking_id = b.id
      WHERE b.id=$1 AND s.organizer_id=$2`, [req.params.id, req.user!.id]);
    if (!result.rows.length) { res.status(404).json({ error: 'Booking not found.' }); return; }
    const responses = await pool.query(
      'SELECT r.*, q.question_text FROM responses r JOIN questions q ON r.question_id=q.id WHERE r.booking_id=$1',
      [req.params.id]
    );
    res.json({ ...result.rows[0], responses: responses.rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const allowed = ['confirmed', 'rejected', 'cancelled'];
  if (!allowed.includes(status)) { res.status(400).json({ error: 'Invalid status.' }); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingRes = await client.query(`
      SELECT b.*, s.organizer_id FROM bookings b
      JOIN services s ON b.service_id=s.id WHERE b.id=$1 AND s.organizer_id=$2`,
      [req.params.id, req.user!.id]
    );
    if (!bookingRes.rows.length) { res.status(404).json({ error: 'Booking not found.' }); await client.query('ROLLBACK'); return; }
    const booking = bookingRes.rows[0];
    if (['rejected', 'cancelled'].includes(status) && booking.status === 'confirmed') {
      await client.query('UPDATE slots SET booked_count = booked_count - 1 WHERE id=$1 AND booked_count > 0', [booking.slot_id]);
    }
    const updated = await client.query(
      'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *', [status, req.params.id]
    );
    
    // Get service title for notification
    const svcInfo = await client.query('SELECT title FROM services WHERE id=$1', [booking.service_id]);
    const serviceTitle = svcInfo.rows[0]?.title || 'Service';

    await client.query('COMMIT');

    // Notify Customer
    await createNotification(
      booking.customer_id,
      `Booking Update: ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your booking for "${serviceTitle}" has been ${status} by the organizer.`,
      status === 'confirmed' ? 'success' : 'warning'
    );

    res.json(updated.rows[0]);
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

export const rescheduleBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { new_slot_id } = req.body;
  if (!new_slot_id) { res.status(400).json({ error: 'new_slot_id is required.' }); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingRes = await client.query(`
      SELECT b.*, s.organizer_id, s.id as service_id FROM bookings b
      JOIN services s ON b.service_id=s.id WHERE b.id=$1 AND s.organizer_id=$2`,
      [req.params.id, req.user!.id]
    );
    if (!bookingRes.rows.length) { res.status(404).json({ error: 'Booking not found.' }); await client.query('ROLLBACK'); return; }
    const booking = bookingRes.rows[0];
    const newSlotRes = await client.query(
      'SELECT * FROM slots WHERE id=$1 AND service_id=$2', [new_slot_id, booking.service_id]
    );
    if (!newSlotRes.rows.length) { res.status(400).json({ error: 'New slot not found for this service.' }); await client.query('ROLLBACK'); return; }
    const newSlot = newSlotRes.rows[0];
    if (newSlot.booked_count >= newSlot.capacity) { res.status(409).json({ error: 'New slot is fully booked.' }); await client.query('ROLLBACK'); return; }
    // Free old slot
    if (booking.status === 'confirmed') {
      await client.query('UPDATE slots SET booked_count=booked_count-1 WHERE id=$1 AND booked_count>0', [booking.slot_id]);
    }
    // Book new slot
    await client.query('UPDATE slots SET booked_count=booked_count+1 WHERE id=$1', [new_slot_id]);
    const updated = await client.query(
      "UPDATE bookings SET slot_id=$1, status='rescheduled' WHERE id=$2 RETURNING *",
      [new_slot_id, req.params.id]
    );
    await client.query('COMMIT');
    res.json(updated.rows[0]);
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};
