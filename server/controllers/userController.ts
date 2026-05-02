import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import crypto from 'crypto';
import { createNotification } from '../services/notificationService.js';

// User gets their own bookings
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  try {
    let query = `
      SELECT b.*, s.title as service_title, s.duration_mins, sl.slot_date, sl.start_time, sl.end_time, u.name as organizer_name, p.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      JOIN users u ON s.organizer_id = u.id
      LEFT JOIN providers p ON sl.provider_id = p.id
      WHERE b.customer_id = $1
    `;
    const params: any[] = [req.user!.id];
    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }
    query += ' ORDER BY sl.slot_date DESC, sl.start_time DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

// User creates a booking
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
    const { 
      slot_id, service_id, customer_name, customer_email, customer_phone, notes, responses, 
      meeting_type = 'OFFLINE',
      pre_meeting_needed = false,
      pre_meeting_type = 'OFFLINE',
      pre_meeting_time = null
    } = req.body;

    if (!slot_id || !service_id) { res.status(400).json({ error: 'slot_id and service_id are required.' }); return; }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Verify service is ACTIVE
      const svcRes = await client.query("SELECT * FROM services WHERE id=$1 AND status='ACTIVE'", [service_id]);
      if (!svcRes.rows.length) { res.status(400).json({ error: 'Service is not available for booking.' }); await client.query('ROLLBACK'); return; }
      const service = svcRes.rows[0];
      
      // Lock slot row for update
      const slotRes = await client.query('SELECT * FROM slots WHERE id=$1 FOR UPDATE', [slot_id]);
      if (!slotRes.rows.length) { res.status(404).json({ error: 'Slot not found.' }); await client.query('ROLLBACK'); return; }
      const slot = slotRes.rows[0];
      
      if (slot.booked_count >= slot.capacity) { res.status(409).json({ error: 'This slot is fully booked. Please choose another.' }); await client.query('ROLLBACK'); return; }
      
      // Check if same user already booked this slot
      const existing = await client.query('SELECT id FROM bookings WHERE slot_id=$1 AND customer_id=$2', [slot_id, req.user!.id]);
      if (existing.rows.length) { res.status(409).json({ error: 'You already have a booking for this slot.' }); await client.query('ROLLBACK'); return; }
      
      const refCode = 'BS-' + crypto.randomBytes(4).toString('hex').toUpperCase();
      let status = service.auto_confirm ? 'confirmed' : 'pending';
      if (Number(service.advance_payment) > 0) {
        status = 'pending';
      }
      // Main Meeting
      let meetingId = null;
      let meetingLink = null;
      let meetingStatus = 'NOT_CREATED';
      if (meeting_type === 'ONLINE') {
        meetingId = `booking_${refCode}_${Date.now()}`;
        meetingLink = `https://meet.jit.si/${meetingId}`;
        meetingStatus = 'CREATED';
      }

      // Pre-Consultation Meeting
      let preMeetingLink = null;
      if (pre_meeting_needed && pre_meeting_type === 'ONLINE') {
        const preId = `pre_${refCode}_${Date.now()}`;
        preMeetingLink = `https://meet.jit.si/${preId}`;
      }

      const bookingRes = await client.query(
        `INSERT INTO bookings (
          slot_id, customer_id, service_id, customer_name, customer_email, customer_phone, 
          status, notes, reference_code, meeting_type, meeting_id, meeting_link, meeting_status,
          pre_meeting_needed, pre_meeting_type, pre_meeting_time, pre_meeting_link
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
        [
          slot_id, req.user!.id, service_id, customer_name, customer_email, customer_phone, 
          status, notes || null, refCode, meeting_type, meetingId, meetingLink, meetingStatus,
          pre_meeting_needed, pre_meeting_type, pre_meeting_time || null, preMeetingLink
        ]
      );
      const bookingId = bookingRes.rows[0].id;
      
      await client.query('UPDATE slots SET booked_count=booked_count+1 WHERE id=$1', [slot_id]);
      
      // Save advance payment if required
      if (service.advance_payment > 0) {
        await client.query(
          "INSERT INTO payments (booking_id, amount, status) VALUES ($1,$2,'pending')", [bookingId, service.advance_payment]
        );
      }
      
      // Save custom question responses
      if (responses?.length) {
        for (const r of responses) {
          await client.query('INSERT INTO responses (booking_id, question_id, response_text) VALUES ($1,$2,$3)',
            [bookingId, r.question_id, r.response_text]);
        }
      }
      
      await client.query('COMMIT');

      // Notifications
      await createNotification(
        service.organizer_id,
        'New Booking Received',
        `${customer_name || 'A customer'} has booked "${service.title}" for ${slot.slot_date} at ${slot.start_time.slice(0, 5)}.`,
        'info'
      );

      await createNotification(
        req.user!.id,
        'Booking Request Sent',
        `Your booking for "${service.title}" is ${status}. Ref: ${refCode}`,
        'success'
      );

      res.status(201).json(bookingRes.rows[0]);
    } catch (err: any) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
};

export const cancelMyBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingRes = await client.query(`
      SELECT b.*, s.title as service_title, s.organizer_id, sl.slot_date, sl.start_time
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      WHERE b.id=$1 AND b.customer_id=$2
    `, [id, req.user!.id]);
    
    if (!bookingRes.rows.length) { 
      res.status(404).json({ error: 'Booking not found or cannot be cancelled.' }); 
      await client.query('ROLLBACK');
      return; 
    }
    const booking = bookingRes.rows[0];
    if (booking.status === 'cancelled' || booking.status === 'rejected') {
      res.status(400).json({ error: 'Booking is already cancelled or rejected.' });
      await client.query('ROLLBACK');
      return;
    }
    if (booking.status === 'confirmed') {
      await client.query('UPDATE slots SET booked_count = booked_count - 1 WHERE id=$1 AND booked_count > 0', [booking.slot_id]);
    }
    const updated = await client.query(
      "UPDATE bookings SET status='cancelled' WHERE id=$1 RETURNING *",
      [id]
    );
    await client.query('COMMIT');

    // Notify Customer
    await createNotification(
      booking.customer_id,
      'Booking Cancelled',
      `You have successfully cancelled your booking for "${booking.service_title}".`,
      'info'
    );

    // Notify Organizer
    await createNotification(
      booking.organizer_id,
      'Booking Cancelled by Customer',
      `The customer (${booking.customer_name || 'A customer'}) has cancelled their booking for "${booking.service_title}" on ${new Date(booking.slot_date).toLocaleDateString()} at ${booking.start_time.slice(0, 5)}.`,
      'warning'
    );

    res.json(updated.rows[0]);
  } catch (err: any) { 
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message }); 
  } finally {
    client.release();
  }
};

export const rescheduleMyBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { slot_id } = req.body;
  if (!slot_id) { res.status(400).json({ error: 'slot_id is required.' }); return; }
  try {
    const result = await pool.query(
      'UPDATE bookings SET slot_id=$1, status=$2 WHERE id=$3 AND customer_id=$4 RETURNING *',
      [slot_id, 'rescheduled', id, req.user!.id]
    );
    if (!result.rows.length) { res.status(404).json({ error: 'Booking not found.' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getActiveServices = async (req: any, res: Response): Promise<void> => {
  const { category_id, search } = req.query;
  try {
    let query = "SELECT * FROM services WHERE status = 'ACTIVE'";
    const params: any[] = [];
    if (category_id) { params.push(category_id); query += ` AND category_id = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`; }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getServiceDetailPublic = async (req: any, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const svcRes = await pool.query('SELECT * FROM services WHERE id = $1', [id]);
    if (!svcRes.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    const service = svcRes.rows[0];
    
    // Fix: Join with service_providers
    const providers = await pool.query(
      `SELECT p.* FROM providers p 
       JOIN service_providers sp ON p.id = sp.provider_id 
       WHERE sp.service_id = $1 AND p.is_active = TRUE`, 
      [id]
    );
    
    const questions = await pool.query('SELECT * FROM questions WHERE service_id = $1 ORDER BY sort_order', [id]);
    
    // Fetch available slots with provider names
    const slots = await pool.query(
      `SELECT sl.*, p.name as provider_name 
       FROM slots sl 
       LEFT JOIN providers p ON sl.provider_id = p.id 
       WHERE sl.service_id = $1 AND sl.booked_count < sl.capacity
       ORDER BY sl.slot_date, sl.start_time`,
      [id]
    );
    
    res.json({ 
      ...service, 
      providers: providers.rows, 
      questions: questions.rows,
      available_slots: slots.rows 
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getServiceByPrivateToken = async (req: any, res: Response): Promise<void> => {
  const { token } = req.params;
  try {
    const svcRes = await pool.query('SELECT * FROM services WHERE private_link_token = $1', [token]);
    if (!svcRes.rows.length) { res.status(404).json({ error: 'Invalid or expired link.' }); return; }
    const service = svcRes.rows[0];

    // Get organizer name
    const orgRes = await pool.query('SELECT name FROM users WHERE id = $1', [service.organizer_id]);
    service.organizer_name = orgRes.rows[0]?.name || 'Unknown';

    const providers = await pool.query(
      `SELECT p.* FROM providers p 
       JOIN service_providers sp ON p.id = sp.provider_id 
       WHERE sp.service_id = $1 AND p.is_active = TRUE`, 
      [service.id]
    );
    
    const questions = await pool.query('SELECT * FROM questions WHERE service_id = $1 ORDER BY sort_order', [service.id]);
    
    const slots = await pool.query(
      `SELECT sl.*, p.name as provider_name 
       FROM slots sl 
       LEFT JOIN providers p ON sl.provider_id = p.id 
       WHERE sl.service_id = $1 AND sl.booked_count < sl.capacity
       ORDER BY sl.slot_date, sl.start_time`,
      [service.id]
    );
    
    res.json({ 
      ...service, 
      providers: providers.rows, 
      questions: questions.rows,
      available_slots: slots.rows 
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
