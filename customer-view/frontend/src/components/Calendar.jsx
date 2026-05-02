import React, { useState } from 'react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar({ selectedDate, onSelect, availableDates = [] }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="calendar-wrapper">
      <div className="calendar-header">
        <button className="btn btn-outline btn-sm" onClick={prevMonth}>‹</button>
        <span className="calendar-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="btn btn-outline btn-sm" onClick={nextMonth}>›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = selectedDate === dateStr;
          const isPast = new Date(dateStr) < new Date(today.toDateString());
          const isAvailable = availableDates.length === 0 ? !isPast : availableDates.includes(dateStr);

          let cls = 'calendar-day ';
          if (isSelected) cls += 'selected';
          else if (isPast) cls += 'disabled';
          else if (isAvailable) cls += isToday ? 'available today' : 'available';
          else cls += 'disabled';

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => !isPast && isAvailable && onSelect && onSelect(dateStr)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
