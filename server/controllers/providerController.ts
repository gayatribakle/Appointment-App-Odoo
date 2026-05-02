import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getProviders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM providers WHERE organizer_id = $1 ORDER BY created_at DESC', [req.user!.id]);
    res.json(result.rows);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const createProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;
  if (!name) { res.status(400).json({ error: 'Name is required.' }); return; }
  try {
    const result = await pool.query(
      'INSERT INTO providers (organizer_id, name, description) VALUES ($1,$2,$3) RETURNING *',
      [req.user!.id, name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE providers SET name=$1, description=$2, is_active=$3 WHERE id=$4 AND organizer_id=$5 RETURNING *',
      [name, description, is_active, req.params.id, req.user!.id]
    );
    if (!result.rows.length) { res.status(404).json({ error: 'Provider not found.' }); return; }
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const deleteProvider = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM providers WHERE id = $1 AND organizer_id = $2', [req.params.id, req.user!.id]);
    res.json({ message: 'Provider deleted.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const linkProviderToService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, provider_id } = req.body;
  try {
    // Verify ownership
    const svc = await pool.query('SELECT id FROM services WHERE id=$1 AND organizer_id=$2', [service_id, req.user!.id]);
    const prv = await pool.query('SELECT id FROM providers WHERE id=$1 AND organizer_id=$2', [provider_id, req.user!.id]);
    if (!svc.rows.length || !prv.rows.length) { res.status(403).json({ error: 'Access denied.' }); return; }
    
    await pool.query('INSERT INTO service_providers (service_id, provider_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [service_id, provider_id]);
    res.json({ message: 'Linked successfully.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const unlinkProviderFromService = async (req: AuthRequest, res: Response): Promise<void> => {
  const { service_id, provider_id } = req.body;
  try {
    await pool.query('DELETE FROM service_providers WHERE service_id=$1 AND provider_id=$2', [service_id, provider_id]);
    res.json({ message: 'Unlinked successfully.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
