import express from 'express';
import cors from 'cors';
import db from './db.js';
import { generateAllSlots, recalculateSlotStatus } from './slotEngine.js';

const app = express();
app.use(cors());
app.use(express.json());

// Generate slots on startup
generateAllSlots(db);

// === SERVICES ===
app.get('/api/services', (req, res) => {
  const services = db.prepare('SELECT * FROM services').all();
  // attach provider counts
  const result = services.map(s => {
    const pCount = db.prepare('SELECT COUNT(*) as count FROM provider_services WHERE service_id = ?').get(s.id).count;
    return { ...s, providers: pCount };
  });
  res.json(result);
});

app.post('/api/services', (req, res) => {
  const { name, description, duration, capacity, type } = req.body;
  const info = db.prepare(`
    INSERT INTO services (name, description, duration, capacity, type) 
    VALUES (?, ?, ?, ?, ?)
  `).run(name, description || '', duration || 60, capacity || 1, type || 'One-to-One');
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/services/:id', (req, res) => {
  const { name, description, duration, capacity, type, status, buffer_before, buffer_after, advance_booking_limit, cancellation_deadline } = req.body;
  db.prepare(`
    UPDATE services 
    SET name=?, description=?, duration=?, capacity=?, type=?, status=?, buffer_before=?, buffer_after=?, advance_booking_limit=?, cancellation_deadline=?
    WHERE id=?
  `).run(name, description, duration, capacity, type, status, buffer_before, buffer_after, advance_booking_limit, cancellation_deadline, req.params.id);
  // Regenerate slots in case rules changed (for simplicity, delete future empty slots and regenerate)
  db.prepare('DELETE FROM slots WHERE service_id = ? AND booked_count = 0').run(req.params.id);
  generateAllSlots(db);
  res.json({ success: true });
});

app.delete('/api/services/:id', (req, res) => {
  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === PROVIDERS ===
app.get('/api/providers', (req, res) => {
  const providers = db.prepare('SELECT * FROM providers').all();
  const result = providers.map(p => {
    const services = db.prepare(`
      SELECT s.name FROM services s
      JOIN provider_services ps ON ps.service_id = s.id
      WHERE ps.provider_id = ?
    `).all(p.id).map(s => s.name);
    return { ...p, services };
  });
  res.json(result);
});

app.post('/api/providers', (req, res) => {
  const { name, type, hours_per_week, status } = req.body;
  const info = db.prepare(`
    INSERT INTO providers (name, type, hours_per_week, status)
    VALUES (?, ?, ?, ?)
  `).run(name, type || 'Provider', hours_per_week || 40, status || 'available');
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/providers/:id', (req, res) => {
  const { name, type, hours_per_week, status } = req.body;
  db.prepare(`
    UPDATE providers 
    SET name=?, type=?, hours_per_week=?, status=?
    WHERE id=?
  `).run(name, type, hours_per_week, status, req.params.id);
  res.json({ success: true });
});

app.delete('/api/providers/:id', (req, res) => {
  db.prepare('DELETE FROM providers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// === SCHEDULE ===
app.get('/api/schedule', (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedule WHERE id = 1').get();
  schedule.working_days = JSON.parse(schedule.working_days);
  res.json(schedule);
});

app.put('/api/schedule', (req, res) => {
  const { working_days, start_time, end_time, slot_interval } = req.body;
  db.prepare(`
    UPDATE schedule 
    SET working_days=?, start_time=?, end_time=?, slot_interval=? 
    WHERE id=1
  `).run(JSON.stringify(working_days), start_time, end_time, slot_interval);
  
  // Clean up unbooked slots and regenerate
  db.prepare("DELETE FROM slots WHERE booked_count = 0 AND date >= date('now')").run();
  generateAllSlots(db);
  
  res.json({ success: true });
});

// === SLOTS ===
app.get('/api/slots', (req, res) => {
  // Ensure slots are up to date
  generateAllSlots(db);
  const slots = db.prepare(`
    SELECT s.*, p.name as provider_name, srv.name as service_name
    FROM slots s
    JOIN providers p ON s.provider_id = p.id
    JOIN services srv ON s.service_id = srv.id
    WHERE s.date >= date('now')
    ORDER BY s.date ASC, s.start_time ASC
  `).all();
  
  res.json(slots.map(s => ({
    id: s.id,
    time: `${s.start_time} - ${s.end_time}`,
    date: s.date,
    provider: s.provider_name,
    service: s.service_name,
    capacity: s.capacity,
    booked: s.booked_count,
    status: s.status,
    demandLevel: s.booked_count >= (s.capacity * 0.8) && s.capacity > 1 ? 'high' : 'low'
  })));
});

// === BOOKINGS ===
app.get('/api/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, srv.name as service_name, p.name as provider_name, s.start_time, s.end_time
    FROM bookings b
    JOIN services srv ON b.service_id = srv.id
    JOIN providers p ON b.provider_id = p.id
    JOIN slots s ON b.slot_id = s.id
    ORDER BY b.date DESC, s.start_time DESC
  `).all();
  
  res.json(bookings.map(b => ({
    id: b.id,
    customer: b.customer,
    service: b.service_name,
    slotTime: `${b.start_time} - ${b.end_time}`,
    provider: b.provider_name,
    status: b.status,
    date: b.date
  })));
});

app.post('/api/bookings', (req, res) => {
  const { customer, service_id, slot_id } = req.body;
  const slot = db.prepare('SELECT * FROM slots WHERE id = ?').get(slot_id);
  if (!slot || slot.status === 'full' || slot.status === 'blocked') {
    return res.status(400).json({ error: 'Slot not available' });
  }
  
  db.transaction(() => {
    db.prepare(`
      INSERT INTO bookings (customer, service_id, slot_id, provider_id, status, date)
      VALUES (?, ?, ?, ?, 'confirmed', ?)
    `).run(customer, service_id, slot_id, slot.provider_id, slot.date);
    
    db.prepare('UPDATE slots SET booked_count = booked_count + 1 WHERE id = ?').run(slot_id);
    recalculateSlotStatus(db, slot_id);
  })();
  
  res.json({ success: true });
});

app.put('/api/bookings/:id/cancel', (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking || booking.status === 'cancelled') return res.status(400).json({ error: 'Invalid booking' });

  db.transaction(() => {
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
    db.prepare('UPDATE slots SET booked_count = booked_count - 1 WHERE id = ?').run(booking.slot_id);
    recalculateSlotStatus(db, booking.slot_id);
  })();
  
  res.json({ success: true });
});

app.put('/api/bookings/:id/reschedule', (req, res) => {
  const { new_slot_id } = req.body;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  const newSlot = db.prepare('SELECT * FROM slots WHERE id = ?').get(new_slot_id);
  
  if (!booking || !newSlot || newSlot.status === 'full' || newSlot.status === 'blocked') {
    return res.status(400).json({ error: 'Invalid operation' });
  }
  
  db.transaction(() => {
    // Remove from old slot
    db.prepare('UPDATE slots SET booked_count = booked_count - 1 WHERE id = ?').run(booking.slot_id);
    recalculateSlotStatus(db, booking.slot_id);
    
    // Add to new slot
    db.prepare('UPDATE slots SET booked_count = booked_count + 1 WHERE id = ?').run(new_slot_id);
    recalculateSlotStatus(db, new_slot_id);
    
    // Update booking
    db.prepare('UPDATE bookings SET slot_id = ?, provider_id = ?, date = ? WHERE id = ?')
      .run(new_slot_id, newSlot.provider_id, newSlot.date, req.params.id);
  })();
  
  res.json({ success: true });
});

// === DASHBOARD ===
app.get('/api/dashboard', (req, res) => {
  try {
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
    const activeServices = db.prepare("SELECT COUNT(*) as count FROM services WHERE status = 'active'").get().count;
    const providersCount = db.prepare('SELECT COUNT(*) as count FROM providers').get().count;
    
    // Utilization: booked slots vs total slots
    const totalSlots = db.prepare("SELECT COUNT(*) as count FROM slots WHERE date >= date('now')").get().count;
    const bookedSlots = db.prepare("SELECT SUM(booked_count) as total_booked FROM slots WHERE date >= date('now')").get().total_booked || 0;
    const totalCapacity = db.prepare("SELECT SUM(capacity) as total_cap FROM slots WHERE date >= date('now')").get().total_cap || 1;
    const utilization = Math.round((bookedSlots / totalCapacity) * 100) || 0;

    // Peak hours
    const hours = db.prepare(`
      SELECT strftime('%H', s.start_time) as hour, SUM(s.booked_count) as bookings
      FROM slots s
      GROUP BY strftime('%H', s.start_time)
    `).all();
    const peakHoursData = hours.map(h => ({
      hour: parseInt(h.hour) > 12 ? `${parseInt(h.hour) - 12} PM` : `${h.hour} AM`,
      bookings: h.bookings
    }));

    const recentBookings = db.prepare(`
      SELECT b.customer, srv.name as service, b.status, s.start_time as time
      FROM bookings b
      JOIN services srv ON b.service_id = srv.id
      JOIN slots s ON b.slot_id = s.id
      ORDER BY b.id DESC LIMIT 5
    `).all();

    res.json({
      kpis: [
        { label: 'Total Bookings', value: totalBookings.toString(), trend: '+12%', isUp: true },
        { label: 'Active Services', value: activeServices.toString(), trend: '+2', isUp: true },
        { label: 'Providers Count', value: providersCount.toString(), trend: 'Stable', isUp: false },
        { label: 'Utilization', value: `${utilization}%`, trend: '+5%', isUp: true }
      ],
      peakHoursData,
      recentBookings
    });
  } catch (err) {
    console.error('Dashboard API Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
