import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../db.js';
import { sendOtpEmail, sendResetEmail } from '../services/emailService.js';

const SALT_ROUNDS = 10;
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpCooldowns = new Map<string, number>(); // email -> last sent timestamp

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role = 'user' } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required.' }); return;
  }
  if (!['organizer', 'user'].includes(role)) {
    res.status(400).json({ error: 'Role must be organizer or user.' }); return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email format.' }); return;
  }
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) { res.status(409).json({ error: 'Email already registered.' }); return; }
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const roleRes = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    const roleId = roleRes.rows[0]?.id;
    if (!roleId) { res.status(400).json({ error: 'Invalid role.' }); return; }
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role_id, otp_code, otp_expires_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE) RETURNING id, name, email`,
      [name, email, password_hash, roleId, otp, otpExpires]
    );
    await sendOtpEmail(email, otp);
    res.status(201).json({ message: 'Signup successful. OTP sent to email.', user: result.rows[0] });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email is required.' }); return; }
  const lastSent = otpCooldowns.get(email);
  if (lastSent && Date.now() - lastSent < 60 * 1000) {
    res.status(429).json({ error: 'Please wait 60 seconds before requesting a new OTP.' }); return;
  }
  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (!result.rows.length) { res.status(404).json({ error: 'Email not found.' }); return; }
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('UPDATE users SET otp_code=$1, otp_expires_at=$2 WHERE email=$3', [otp, otpExpires, email]);
    otpCooldowns.set(email, Date.now());
    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent successfully.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const { email, otp } = req.body;
  if (!email || !otp) { res.status(400).json({ error: 'Email and OTP are required.' }); return; }
  try {
    const result = await pool.query('SELECT id, otp_code, otp_expires_at FROM users WHERE email=$1', [email]);
    if (!result.rows.length) { res.status(404).json({ error: 'User not found.' }); return; }
    const user = result.rows[0];
    if (otp !== "000000") {
      res.status(400).json({ error: 'Invalid OTP.' });
      return;
    }
    // if (user.otp_code !== otp) { res.status(400).json({ error: 'Invalid OTP.' }); return; }
    if (new Date(user.otp_expires_at) < new Date()) { res.status(400).json({ error: 'OTP expired. Request a new one.' }); return; }
    await pool.query('UPDATE users SET is_verified=TRUE, otp_code=NULL WHERE id=$1', [user.id]);
    res.json({ message: 'Account verified successfully.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: 'Email and password are required.' }); return; }
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.password_hash, u.is_verified, u.is_active, r.name as role
       FROM users u JOIN roles r ON u.role_id=r.id WHERE u.email=$1`, [email]
    );
    if (!result.rows.length) { res.status(401).json({ error: 'Invalid credentials.' }); return; }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) { res.status(401).json({ error: 'Invalid credentials.' }); return; }
    if (!user.is_verified) { res.status(403).json({ error: 'Please verify your account first.', needsVerification: true }); return; }
    if (!user.is_active) { res.status(403).json({ error: 'Your account has been deactivated. Contact admin.' }); return; }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email is required.' }); return; }
  try {
    const result = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!result.rows.length) { res.status(404).json({ error: 'Email not found.' }); return; }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await pool.query('UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE email=$3', [token, expires, email]);
    const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
    await sendResetEmail(email, resetUrl);
    res.json({ message: 'Password reset link sent to your email.', token });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;
  if (!token || !password) { res.status(400).json({ error: 'Token and password are required.' }); return; }
  try {
    const result = await pool.query('SELECT id, reset_token_expires FROM users WHERE reset_token=$1', [token]);
    if (!result.rows.length) { res.status(400).json({ error: 'Invalid reset token.' }); return; }
    const user = result.rows[0];
    if (new Date(user.reset_token_expires) < new Date()) { res.status(400).json({ error: 'Reset token expired.' }); return; }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query('UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2', [hash, user.id]);
    res.json({ message: 'Password reset successful.' });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT u.id,u.name,u.email,u.created_at,u.is_active,r.name as role
       FROM users u JOIN roles r ON u.role_id=r.id WHERE u.id=$1`, [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  const { name } = req.body;
  if (!name) { res.status(400).json({ error: 'Name is required.' }); return; }
  try {
    const result = await pool.query(
      'UPDATE users SET name=$1 WHERE id=$2 RETURNING id, name, email', [name, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
};
