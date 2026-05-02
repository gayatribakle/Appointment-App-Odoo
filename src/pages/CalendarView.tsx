import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_CLASS: Record<string, string> = {
  pending: 'event-pending', confirmed: 'event-confirmed',
  rejected: 'event-rejected', cancelled: 'event-cancelled',
};

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = (month: Date) => {
    setLoading(true);
    const from = format(startOfMonth(month), 'yyyy-MM-dd');
    const to = format(endOfMonth(month), 'yyyy-MM-dd');
    api.getCalendarEvents(from, to)
      .then((d: any) => setEvents(d))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(currentMonth); }, [currentMonth]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter((e: any) => {
      const evDate = typeof e.slot_date === 'string' ? e.slot_date.split('T')[0] : format(new Date(e.slot_date), 'yyyy-MM-dd');
      return evDate === dateStr;
    });
  };

  const buildCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) { days.push(day); day = addDays(day, 1); }
    return days;
  };

  const days = buildCalendarDays();

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">Visual overview of your bookings</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-icon" onClick={() => setCurrentMonth(m => subMonths(m, 1))}><ChevronLeft size={18} /></button>
          <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: 130, textAlign: 'center' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button className="btn btn-secondary btn-icon" onClick={() => setCurrentMonth(m => addMonths(m, 1))}><ChevronRight size={18} /></button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentMonth(new Date())}>Today</button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.8rem' }}>
        {Object.entries({ pending: '#f59e0b', confirmed: '#10b981', rejected: '#ef4444', cancelled: '#94a3b8' }).map(([s, c]) => (
          <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        ))}
      </div>

      <div className="card" style={{ padding: 16 }}>
        {/* Day headers */}
        <div className="calendar-grid" style={{ marginBottom: 8 }}>
          {DAY_NAMES.map(d => <div key={d} className="calendar-day-header">{d}</div>)}
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="calendar-grid">
            {days.map((day, i) => {
              const dayEvents = getEventsForDate(day);
              const sameMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);
              return (
                <div key={i} className={`calendar-cell${today ? ' today' : ''}${!sameMonth ? ' other-month' : ''}`}>
                  <div className="calendar-date" style={{ color: today ? 'var(--primary)' : undefined }}>
                    {format(day, 'd')}
                  </div>
                  {dayEvents.slice(0, 3).map((ev: any, j: number) => (
                    <div key={j} className={`calendar-event ${STATUS_CLASS[ev.status] || ''}`}
                      title={`${ev.customer_name} - ${ev.service_title} ${ev.start_time?.slice(0, 5)}`}>
                      {ev.start_time?.slice(0, 5)} {ev.customer_name || ev.service_title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', paddingLeft: 4 }}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
