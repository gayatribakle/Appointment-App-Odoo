import { addDays, format, parse, isBefore, addMinutes, startOfDay, isSameDay } from 'date-fns';

export function generateSlotsForProvider(db, providerId, serviceId, daysAhead = 14) {
  const schedule = db.prepare('SELECT * FROM schedule WHERE id = 1').get();
  if (!schedule) return;

  const workingDays = JSON.parse(schedule.working_days);
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(serviceId);
  const provider = db.prepare('SELECT * FROM providers WHERE id = ?').get(providerId);
  
  if (!service || !provider || provider.status !== 'available') return;

  const today = startOfDay(new Date());

  const insertSlot = db.prepare(`
    INSERT INTO slots (date, start_time, end_time, provider_id, service_id, capacity, booked_count, status)
    VALUES (?, ?, ?, ?, ?, ?, 0, 'available')
  `);

  for (let i = 0; i < daysAhead; i++) {
    const currentDate = addDays(today, i);
    const dayOfWeek = currentDate.getDay();
    // JS getDay(): 0=Sun, 1=Mon...6=Sat. 
    // Frontend DAYS: 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun' -> 0=Mon, 6=Sun
    const workingDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    if (!workingDays[workingDayIndex]) continue;

    const dateStr = format(currentDate, 'yyyy-MM-dd');
    
    // Check if slots already exist for this date, provider and service
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM slots WHERE date = ? AND provider_id = ? AND service_id = ?').get(dateStr, providerId, serviceId).count;
    if (existingCount > 0) continue; // Already generated

    const startTimeParts = schedule.start_time.split(':').map(Number);
    const endTimeParts = schedule.end_time.split(':').map(Number);
    
    let currentSlotStart = new Date(currentDate);
    currentSlotStart.setHours(startTimeParts[0], startTimeParts[1], 0, 0);
    
    let dayEnd = new Date(currentDate);
    dayEnd.setHours(endTimeParts[0], endTimeParts[1], 0, 0);

    const slotInterval = schedule.slot_interval || 60;

    while (isBefore(currentSlotStart, dayEnd)) {
      let slotEnd = addMinutes(currentSlotStart, service.duration);
      
      // If the slot end exceeds day end, don't create the slot
      if (isBefore(dayEnd, slotEnd)) break;

      const startTimeStr = format(currentSlotStart, 'HH:mm');
      const endTimeStr = format(slotEnd, 'HH:mm');

      insertSlot.run(dateStr, startTimeStr, endTimeStr, providerId, serviceId, service.capacity);

      // Increment by interval
      currentSlotStart = addMinutes(currentSlotStart, slotInterval);
    }
  }
}

export function generateAllSlots(db) {
  const providerServices = db.prepare('SELECT provider_id, service_id FROM provider_services').all();
  
  // Clean up old past slots (optional, skipping for simplicity)
  
  for (const ps of providerServices) {
    generateSlotsForProvider(db, ps.provider_id, ps.service_id, 14);
  }
}

export function recalculateSlotStatus(db, slotId) {
  const slot = db.prepare('SELECT * FROM slots WHERE id = ?').get(slotId);
  if (!slot) return;
  
  if (slot.status === 'blocked') return; // Cannot override blocked
  
  if (slot.booked_count >= slot.capacity) {
    db.prepare("UPDATE slots SET status = 'full' WHERE id = ?").run(slotId);
  } else if (slot.booked_count > 0 && slot.booked_count < slot.capacity) {
    db.prepare("UPDATE slots SET status = 'partial' WHERE id = ?").run(slotId);
  } else {
    db.prepare("UPDATE slots SET status = 'available' WHERE id = ?").run(slotId);
  }
}
