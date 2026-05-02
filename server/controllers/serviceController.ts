import { Response } from 'express';
import crypto from 'crypto';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getServices = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM bookings b JOIN slots sl ON b.slot_id = sl.id WHERE sl.service_id = s.id) as total_bookings
       FROM services s WHERE s.organizer_id = $1 ORDER BY s.created_at DESC`,
      [req.user!.id]
    );
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const service = await pool.query('SELECT * FROM services WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user!.id]);
    if (!service.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    const rules = await pool.query('SELECT * FROM availability_rules WHERE service_id = $1 ORDER BY day_of_week', [req.params.id]);
    const questions = await pool.query('SELECT * FROM questions WHERE service_id = $1 ORDER BY sort_order', [req.params.id]);
    res.json({ ...service.rows[0], availability_rules: rules.rows, questions: questions.rows });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, duration_mins, type, max_bookings_per_slot, advance_payment, auto_confirm, auto_assign_provider, start_date, end_date, availability_rules, questions } = req.body;
  if (!title || !duration_mins) { res.status(400).json({ error: 'Title and duration are required.' }); return; }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const privateToken = crypto.randomBytes(16).toString('hex');
    const svcResult = await client.query(
      `INSERT INTO services (organizer_id, title, description, duration_mins, type, max_bookings_per_slot, advance_payment, auto_confirm, auto_assign_provider, start_date, end_date, private_link_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [req.user!.id, title, description || null, duration_mins, type || 'user', max_bookings_per_slot || 1, advance_payment || 0, auto_confirm ?? true, auto_assign_provider ?? true, start_date || null, end_date || null, privateToken]
    );
    const serviceId = svcResult.rows[0].id;

    if (availability_rules?.length) {
      for (const rule of availability_rules) {
        await client.query(
          `INSERT INTO availability_rules (service_id, day_of_week, start_time, end_time, slot_interval_mins) VALUES ($1,$2,$3,$4,$5)`,
          [serviceId, rule.day_of_week, rule.start_time, rule.end_time, rule.slot_interval_mins || duration_mins]
        );
      }
    }

    if (questions?.length) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await client.query(
          `INSERT INTO questions (service_id, question_text, question_type, options, is_required, sort_order) VALUES ($1,$2,$3,$4,$5,$6)`,
          [serviceId, q.question_text, q.question_type || 'text', q.options ? JSON.stringify(q.options) : null, q.is_required ?? false, i]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(svcResult.rows[0]);
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally { client.release(); }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, duration_mins, type, max_bookings_per_slot, advance_payment, auto_confirm, auto_assign_provider, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE services SET title=$1, description=$2, duration_mins=$3, type=$4, max_bookings_per_slot=$5, advance_payment=$6, auto_confirm=$7, auto_assign_provider=$8, start_date=$9, end_date=$10,
       status = CASE WHEN status = 'REJECTED' THEN 'PENDING' ELSE status END
       WHERE id=$11 AND organizer_id=$12 RETURNING *`,
      [title, description, duration_mins, type, max_bookings_per_slot, advance_payment, auto_confirm, auto_assign_provider, start_date || null, end_date || null, req.params.id, req.user!.id]
    );
    if (!result.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const togglePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const svc = await pool.query('SELECT status, is_published FROM services WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user!.id]);
    if (!svc.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    if (svc.rows[0].status !== 'ACTIVE') {
      res.status(403).json({ error: 'Service must be approved by admin before publishing.' });
      return;
    }
    const result = await pool.query(
      'UPDATE services SET is_published = $1 WHERE id = $2 RETURNING *',
      [!svc.rows[0].is_published, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM services WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user!.id]);
    res.json({ message: 'Service deleted.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE service_id = $1 ORDER BY sort_order', [req.params.id]);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const addQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  const { question_text, question_type, options, is_required } = req.body;
  if (!question_text) { res.status(400).json({ error: 'Question text is required.' }); return; }
  try {
    const countRes = await pool.query('SELECT COUNT(*) FROM questions WHERE service_id = $1', [req.params.id]);
    const sortOrder = parseInt(countRes.rows[0].count);
    const result = await pool.query(
      `INSERT INTO questions (service_id, question_text, question_type, options, is_required, sort_order) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.id, question_text, question_type || 'text', options ? JSON.stringify(options) : null, is_required ?? false, sortOrder]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [req.params.qid]);
    res.json({ message: 'Question deleted.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
