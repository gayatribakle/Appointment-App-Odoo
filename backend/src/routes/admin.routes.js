const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/admin.controller');

const adminOnly = [authenticate, authorize('ADMIN')];

// Dashboard
router.get('/dashboard', adminOnly, ctrl.getDashboard);

// Users
router.get('/users', adminOnly, ctrl.getUsers);
router.post('/users', adminOnly, ctrl.createUser);
router.patch('/users/:id/status', adminOnly, ctrl.updateUserStatus);

// Providers
router.get('/providers', adminOnly, ctrl.getProviders);
router.post('/providers', adminOnly, ctrl.createProvider);
router.patch('/providers/:id/status', adminOnly, ctrl.updateProviderStatus);
router.delete('/providers/:id', adminOnly, ctrl.deleteProvider);

// Appointments
router.get('/appointments', adminOnly, ctrl.getAppointments);
router.post('/appointments', adminOnly, ctrl.createAppointment);
router.patch('/appointments/:id/status', adminOnly, ctrl.updateAppointmentStatus);

// Time Slots
router.get('/timeslots', adminOnly, ctrl.getTimeSlots);
router.post('/timeslots', adminOnly, ctrl.createTimeSlot);
router.patch('/timeslots/:id/toggle', adminOnly, ctrl.toggleTimeSlot);
router.delete('/timeslots/:id', adminOnly, ctrl.deleteTimeSlot);

// System Settings
router.get('/settings', adminOnly, ctrl.getSettings);
router.put('/settings', adminOnly, ctrl.saveSettings);

module.exports = router;
