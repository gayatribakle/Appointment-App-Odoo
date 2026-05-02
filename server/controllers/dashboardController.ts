import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orgId = req.user!.id;

    const totalBookings = await pool.query(`
      SELECT COUNT(b.id) as count FROM bookings b
      JOIN services s ON b.service_id=s.id WHERE s.organizer_id=$1`, [orgId]);

    const totalRevenue = await pool.query(`
      SELECT COALESCE(SUM(p.amount),0) as total FROM payments p
      JOIN bookings b ON p.booking_id=b.id
      JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1 AND p.status='paid'`, [orgId]);

    const upcomingBookings = await pool.query(`
      SELECT b.*, s.title as service_title, sl.slot_date, sl.start_time, sl.end_time
      FROM bookings b
      JOIN slots sl ON b.slot_id=sl.id
      JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1 AND sl.slot_date >= CURRENT_DATE AND b.status IN ('pending','confirmed')
      ORDER BY sl.slot_date, sl.start_time LIMIT 10`, [orgId]);

    const peakHours = await pool.query(`
      SELECT EXTRACT(HOUR FROM sl.start_time::time) as hour, COUNT(b.id) as bookings
      FROM bookings b
      JOIN slots sl ON b.slot_id=sl.id
      JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1 GROUP BY hour ORDER BY bookings DESC LIMIT 6`, [orgId]);

    const revenueByService = await pool.query(`
      SELECT s.title, COALESCE(SUM(p.amount),0) as revenue, COUNT(b.id) as bookings
      FROM services s
      LEFT JOIN bookings b ON b.service_id=s.id
      LEFT JOIN payments p ON p.booking_id=b.id AND p.status='paid'
      WHERE s.organizer_id=$1 GROUP BY s.id, s.title ORDER BY revenue DESC`, [orgId]);

    const bookingsByStatus = await pool.query(`
      SELECT b.status, COUNT(b.id) as count
      FROM bookings b JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1 GROUP BY b.status`, [orgId]);

    const bookingTrend = await pool.query(`
      SELECT DATE_TRUNC('day', b.created_at)::date as date, COUNT(b.id) as count
      FROM bookings b JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1 AND b.created_at >= NOW()-INTERVAL '30 days'
      GROUP BY date ORDER BY date`, [orgId]);

    res.json({
      totalBookings: parseInt(totalBookings.rows[0].count),
      totalRevenue: parseFloat(totalRevenue.rows[0].total),
      upcomingBookings: upcomingBookings.rows,
      peakHours: peakHours.rows,
      revenueByService: revenueByService.rows,
      bookingsByStatus: bookingsByStatus.rows,
      bookingTrend: bookingTrend.rows,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  const { from, to } = req.query;
  try {
    const result = await pool.query(`
      SELECT b.id, b.customer_name, b.status, s.title as service_title,
             sl.slot_date, sl.start_time, sl.end_time
      FROM bookings b
      JOIN slots sl ON b.slot_id=sl.id
      JOIN services s ON b.service_id=s.id
      WHERE s.organizer_id=$1
        AND sl.slot_date>=$2 AND sl.slot_date<=$3
      ORDER BY sl.slot_date, sl.start_time`,
      [req.user!.id, from || new Date().toISOString().split('T')[0], to || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]]
    );
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
