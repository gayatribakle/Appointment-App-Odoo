const prisma = require('../config/db');
const { hashPassword } = require('../utils/password');

// ─── USERS ────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    res.json(users);
  } catch (e) { next(e); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, role = 'CUSTOMER', password = 'password123' } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role, status: 'ACTIVE' },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (e) { next(e); }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true }
    });
    res.json(user);
  } catch (e) { next(e); }
};

// ─── PROVIDERS ────────────────────────────────────────────
const getProviders = async (req, res, next) => {
  try {
    const providers = await prisma.provider.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(providers);
  } catch (e) { next(e); }
};

const createProvider = async (req, res, next) => {
  try {
    const { name, email, specialty } = req.body;
    const existing = await prisma.provider.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Provider email already exists' });
    const provider = await prisma.provider.create({
      data: { name, email, specialty, status: 'AVAILABLE', appointments: 0 }
    });
    res.status(201).json(provider);
  } catch (e) { next(e); }
};

const updateProviderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const provider = await prisma.provider.update({ where: { id }, data: { status } });
    res.json(provider);
  } catch (e) { next(e); }
};

const deleteProvider = async (req, res, next) => {
  try {
    await prisma.provider.delete({ where: { id: req.params.id } });
    res.json({ message: 'Provider deleted' });
  } catch (e) { next(e); }
};

// ─── APPOINTMENTS ─────────────────────────────────────────
const getAppointments = async (req, res, next) => {
  try {
    const appointments = await prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(appointments);
  } catch (e) { next(e); }
};

const createAppointment = async (req, res, next) => {
  try {
    const { customer, provider, service, date, time, duration = '30 min' } = req.body;

    // Conflict check: same provider, date, time, not cancelled
    const conflict = await prisma.appointment.findFirst({
      where: { provider, date, time, status: { not: 'CANCELLED' } }
    });
    if (conflict) {
      return res.status(409).json({ error: 'This time slot is already booked for the selected provider.' });
    }

    const appointment = await prisma.appointment.create({
      data: { customer, provider, service, date, time, duration, status: 'CONFIRMED' }
    });
    res.status(201).json(appointment);
  } catch (e) { next(e); }
};

const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
    res.json(appointment);
  } catch (e) { next(e); }
};

// ─── TIME SLOTS ───────────────────────────────────────────
const getTimeSlots = async (req, res, next) => {
  try {
    const slots = await prisma.timeSlot.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(slots);
  } catch (e) { next(e); }
};

const createTimeSlot = async (req, res, next) => {
  try {
    const { name, startTime, endTime, maxBookings = 10, duration = 30 } = req.body;
    const slot = await prisma.timeSlot.create({
      data: { name, startTime, endTime, maxBookings, duration, active: true }
    });
    res.status(201).json(slot);
  } catch (e) { next(e); }
};

const toggleTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slot = await prisma.timeSlot.findUnique({ where: { id } });
    const updated = await prisma.timeSlot.update({
      where: { id },
      data: { active: !slot.active }
    });
    res.json(updated);
  } catch (e) { next(e); }
};

const deleteTimeSlot = async (req, res, next) => {
  try {
    await prisma.timeSlot.delete({ where: { id: req.params.id } });
    res.json({ message: 'Time slot deleted' });
  } catch (e) { next(e); }
};

// ─── SYSTEM SETTINGS ──────────────────────────────────────
const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' }
    });
    res.json(settings);
  } catch (e) { next(e); }
};

const saveSettings = async (req, res, next) => {
  try {
    const { maxBookingsPerDay, bookingWindowDays, cancellationWindowHours,
            autoConfirmBookings, requireApproval, emailNotifications, smsNotifications } = req.body;
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'singleton' },
      update: { maxBookingsPerDay, bookingWindowDays, cancellationWindowHours,
                autoConfirmBookings, requireApproval, emailNotifications, smsNotifications },
      create: { id: 'singleton', maxBookingsPerDay, bookingWindowDays, cancellationWindowHours,
                autoConfirmBookings, requireApproval, emailNotifications, smsNotifications }
    });
    res.json({ message: 'Settings saved', settings });
  } catch (e) { next(e); }
};

// ─── DASHBOARD ────────────────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalProviders, totalAppointments, confirmedAppts, recentAppts] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.findMany({ take: 5, orderBy: { createdAt: 'desc' } })
    ]);
    res.json({ totalUsers, totalProviders, totalAppointments, confirmedAppts, recentAppts });
  } catch (e) { next(e); }
};

module.exports = {
  getDashboard,
  getUsers, createUser, updateUserStatus,
  getProviders, createProvider, updateProviderStatus, deleteProvider,
  getAppointments, createAppointment, updateAppointmentStatus,
  getTimeSlots, createTimeSlot, toggleTimeSlot, deleteTimeSlot,
  getSettings, saveSettings
};
