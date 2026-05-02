import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { generateSlotsInternal } from '../services/slotService.js';

export const generateSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, provider_id, days_ahead = 30 } = req.body;
  if (!service_id) { res.status(400).json({ error: 'service_id is required.' }); return; }
  try {
    const svcRes = await pool.query('SELECT * FROM services WHERE id = $1 AND organizer_id = $2', [service_id, req.user!.id]);
    if (!svcRes.rows.length) { res.status(404).json({ error: 'Service not found.' }); return; }
    
    const slotsCreated = await generateSlotsInternal(service_id, days_ahead, provider_id);
    res.json({ message: `${slotsCreated} slots generated.`, slotsCreated });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAvailableSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, date, provider_id } = req.query;
  if (!service_id || !date) { res.status(400).json({ error: 'service_id and date are required.' }); return; }
  try {
    let query = `
      SELECT sl.*, p.name as provider_name 
      FROM slots sl LEFT JOIN providers p ON sl.provider_id = p.id
      WHERE sl.service_id=$1 AND sl.slot_date=$2 AND sl.booked_count < sl.capacity`;
    const params: any[] = [service_id, date];
    
    if (provider_id) {
      params.push(provider_id);
      query += ` AND sl.provider_id = $${params.length}`;
    }

    query += ' ORDER BY sl.start_time';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getAllSlots = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, from, to } = req.query;
  if (!service_id) { res.status(400).json({ error: 'service_id is required.' }); return; }
  try {
    let query = 'SELECT * FROM slots WHERE service_id=$1';
    const params: any[] = [service_id];
    if (from) { params.push(from); query += ` AND slot_date>=$${params.length}`; }
    if (to) { params.push(to); query += ` AND slot_date<=$${params.length}`; }
    query += ' ORDER BY slot_date, start_time';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
