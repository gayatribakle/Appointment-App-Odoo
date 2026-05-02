import { addDays, format, addMinutes } from 'date-fns';
import pool from '../db.js';

export async function generateSlotsInternal(service_id: number, days_ahead: number = 30, provider_id?: number) {
  const svcRes = await pool.query('SELECT * FROM services WHERE id = $1', [service_id]);
  if (!svcRes.rows.length) return 0;
  const service = svcRes.rows[0];

  const rulesRes = await pool.query('SELECT * FROM availability_rules WHERE service_id = $1', [service_id]);
  const rules = rulesRes.rows;
  if (!rules.length) return 0;

  let today = new Date();
  if (service.start_date && new Date(service.start_date) > today) {
    today = new Date(service.start_date);
  }

  let slotsCreated = 0;
  for (let d = 0; d < days_ahead; d++) {
    const currentDate = addDays(today, d);
    if (service.end_date && currentDate > new Date(service.end_date)) break;

    const dayOfWeek = currentDate.getDay();
    const matchingRules = rules.filter((r: any) => r.day_of_week === dayOfWeek);
    for (const rule of matchingRules) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const [sh, sm] = rule.start_time.split(':').map(Number);
      const [eh, em] = rule.end_time.split(':').map(Number);
      let current = new Date(currentDate);
      current.setHours(sh, sm, 0, 0);
      const endLimit = new Date(currentDate);
      endLimit.setHours(eh, em, 0, 0);
      while (current < endLimit) {
        const slotEnd = addMinutes(current, rule.slot_interval_mins);
        if (slotEnd > endLimit) break;
        const startStr = format(current, 'HH:mm');
        const endStr = format(slotEnd, 'HH:mm');
        
        const exists = await pool.query(
          'SELECT id FROM slots WHERE service_id=$1 AND slot_date=$2 AND start_time=$3 AND (provider_id=$4 OR (provider_id IS NULL AND $4 IS NULL))',
          [service_id, dateStr, startStr, provider_id || null]
        );
        
        if (!exists.rows.length) {
          await pool.query(
            'INSERT INTO slots (service_id, provider_id, slot_date, start_time, end_time, capacity) VALUES ($1,$2,$3,$4,$5,$6)',
            [service_id, provider_id || null, dateStr, startStr, endStr, service.max_bookings_per_slot]
          );
          slotsCreated++;
        }
        current = slotEnd;
      }
    }
  }
  return slotsCreated;
}
