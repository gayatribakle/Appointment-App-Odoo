import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { createNotification } from '../services/notificationService.js';

export const getAdminStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, organizers, services, bookings, revenue, pending] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id=r.id WHERE r.name='user'"),
      pool.query("SELECT COUNT(*) FROM users u JOIN roles r ON u.role_id=r.id WHERE r.name='organizer'"),
      pool.query("SELECT COUNT(*) FROM services"),
      pool.query("SELECT COUNT(*) FROM bookings"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status='paid'"),
      pool.query("SELECT COUNT(*) FROM services WHERE status='PENDING'"),
    ]);
    const recentBookings = await pool.query(`
      SELECT b.id, b.customer_name, b.status, s.title as service_title, sl.slot_date, sl.start_time
      FROM bookings b JOIN slots sl ON b.slot_id=sl.id JOIN services s ON b.service_id=s.id
      ORDER BY b.created_at DESC LIMIT 10`);
    const bookingTrend = await pool.query(`
      SELECT DATE_TRUNC('day', b.created_at)::date as date, COUNT(b.id) as count
      FROM bookings b WHERE b.created_at >= NOW()-INTERVAL '30 days'
      GROUP BY date ORDER BY date`);
    const topServices = await pool.query(`
      SELECT s.title, COUNT(b.id) as bookings, COALESCE(SUM(p.amount),0) as revenue
      FROM services s LEFT JOIN bookings b ON b.service_id=s.id
      LEFT JOIN payments p ON p.booking_id=b.id AND p.status='paid'
      GROUP BY s.id, s.title ORDER BY bookings DESC LIMIT 5`);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalOrganizers: parseInt(organizers.rows[0].count),
      totalServices: parseInt(services.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      pendingServices: parseInt(pending.rows[0].count),
      recentBookings: recentBookings.rows,
      bookingTrend: bookingTrend.rows,
      topServices: topServices.rows,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getPendingServices = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as organizer_name, u.email as organizer_email
      FROM services s JOIN users u ON s.organizer_id=u.id
      WHERE s.status='PENDING' ORDER BY s.created_at DESC`);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAllServicesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.query;
  try {
    let query = `SELECT s.*, u.name as organizer_name,
      (SELECT COUNT(*) FROM bookings b JOIN slots sl ON b.slot_id=sl.id WHERE sl.service_id=s.id) as total_bookings
      FROM services s JOIN users u ON s.organizer_id=u.id`;
    const params: any[] = [];
    if (status) { params.push(status); query += ` WHERE s.status=$1`; }
    query += ' ORDER BY s.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const approveService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      "UPDATE services SET status='ACTIVE', rejection_reason=NULL WHERE id=$1 RETURNING *", [req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    
    // Auto-generate slots for the next 30 days
    await generateSlotsInternal(parseInt(req.params.id), 30);
    
    const service = result.rows[0];
    await createNotification(
      service.organizer_id,
      'Service Approved! 🎉',
      `Your service "${service.title}" has been approved and is now active. Slots have been auto-generated.`,
      'success'
    );

    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const rejectService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { reason } = req.body;
  if (!reason) { res.status(400).json({ error: 'Rejection reason is required.' }); return; }
  try {
    const result = await pool.query(
      "UPDATE services SET status='REJECTED', rejection_reason=$1 WHERE id=$2 RETURNING *", [reason, req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    
    const service = result.rows[0];
    await createNotification(
      service.organizer_id,
      'Service Rejected',
      `Your service "${service.title}" was rejected. Reason: ${reason}`,
      'error'
    );

    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.query;
  try {
    let query = `SELECT u.id,u.name,u.email,u.is_verified,u.is_active,u.created_at,r.name as role
      FROM users u JOIN roles r ON u.role_id=r.id`;
    const params: any[] = [];
    if (role) { params.push(role); query += ` WHERE r.name=$1`; }
    query += ' ORDER BY u.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { is_active } = req.body;
  if (typeof is_active !== 'boolean') { res.status(400).json({ error: 'is_active (boolean) required.' }); return; }
  try {
    const result = await pool.query(
      'UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id, name, email, is_active', [is_active, req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: 'User not found.' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.body;
  if (!['user', 'organizer'].includes(role)) { res.status(400).json({ error: 'Role must be user or organizer.' }); return; }
  try {
    const roleRes = await pool.query('SELECT id FROM roles WHERE name=$1', [role]);
    const result = await pool.query(
      'UPDATE users SET role_id=$1 WHERE id=$2 RETURNING id, name, email', [roleRes.rows[0].id, req.params.id]);
    if (!result.rows.length) { res.status(404).json({ error: 'User not found.' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAllBookingsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, service_id, organizer_id, from, to } = req.query;
  try {
    let query = `
      SELECT b.*, s.title as service_title, sl.slot_date, sl.start_time, sl.end_time,
             u.name as organizer_name, p.amount as payment_amount, p.status as payment_status
      FROM bookings b JOIN slots sl ON b.slot_id=sl.id JOIN services s ON b.service_id=s.id
      JOIN users u ON s.organizer_id=u.id LEFT JOIN payments p ON p.booking_id=b.id WHERE 1=1`;
    const params: any[] = [];
    if (status) { params.push(status); query += ` AND b.status=$${params.length}`; }
    if (service_id) { params.push(service_id); query += ` AND b.service_id=$${params.length}`; }
    if (organizer_id) { params.push(organizer_id); query += ` AND s.organizer_id=$${params.length}`; }
    if (from) { params.push(from); query += ` AND sl.slot_date>=$${params.length}`; }
    if (to) { params.push(to); query += ` AND sl.slot_date<=$${params.length}`; }
    query += ' ORDER BY sl.slot_date DESC, sl.start_time DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const adminCancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingRes = await client.query('SELECT * FROM bookings WHERE id=$1', [req.params.id]);
    if (!bookingRes.rows.length) { res.status(404).json({ error: 'Booking not found.' }); await client.query('ROLLBACK'); return; }
    const booking = bookingRes.rows[0];
    if (booking.status === 'confirmed') {
      await client.query('UPDATE slots SET booked_count=booked_count-1 WHERE id=$1 AND booked_count>0', [booking.slot_id]);
    }
    await client.query("UPDATE bookings SET status='cancelled' WHERE id=$1", [req.params.id]);
    await client.query('COMMIT');
    res.json({ message: 'Booking cancelled by admin.' });
  } catch (err: any) { await client.query('ROLLBACK'); res.status(500).json({ error: err.message }); }
  finally { client.release(); }
};
