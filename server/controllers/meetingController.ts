import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getMeetingLink = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  try {
    // Check if user is the customer or the organizer of the service
    const query = `
      SELECT b.*, s.organizer_id, sl.slot_date, sl.start_time, s.duration_mins
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN slots sl ON b.slot_id = sl.id
      WHERE b.id = $1
    `;
    const result = await pool.query(query, [bookingId]);

    if (!result.rows.length) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    const booking = result.rows[0];

    // Authorization check
    const isCustomer = booking.customer_id === userId;
    const isOrganizer = booking.organizer_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isCustomer && !isOrganizer && !isAdmin) {
      res.status(403).json({ error: 'Unauthorized to access this meeting.' });
      return;
    }

    if (booking.meeting_type !== 'ONLINE') {
      res.status(400).json({ error: 'This is not an online meeting.' });
      return;
    }

    // Time window check: Only restrict customers. Organizers and Admins can join anytime to prepare.
    if (isCustomer) {
      const fifteenMins = 15 * 60000;
      const nowTime = now.getTime();
      const schedStart = startTime.getTime();
      const schedEnd = endTime.getTime();

      if (nowTime < schedStart - fifteenMins) {
        res.status(400).json({ error: 'Meeting has not started yet. Please join closer to the start time.' });
        return;
      }

      if (nowTime > schedEnd + fifteenMins) {
        res.status(400).json({ error: 'Meeting has already ended.' });
        return;
      }
    }

    res.json({
      meeting_link: booking.meeting_link,
      meeting_id: booking.meeting_id,
      meeting_status: booking.meeting_status
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!['CREATED', 'ENDED'].includes(status)) {
    res.status(400).json({ error: 'Invalid status.' });
    return;
  }

  try {
    const result = await pool.query(
      'UPDATE bookings SET meeting_status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (!result.rows.length) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
