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

  const goToToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (onSelect) onSelect(dateStr);
  };

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
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={prevMonth} title="Previous Month">‹</button>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={goToToday} 
            style={{ fontSize: 11, padding: '4px 10px' }}
          >
            Today
          </button>
        </div>
        <span className="calendar-month">{MONTHS[viewMonth]} {viewYear}</span>
        <button className="btn btn-outline btn-sm" onClick={nextMonth} title="Next Month">›</button>
      </div>
      <div className="calendar-grid">
        {DAYS.map(d => (
          <div key={d} className="calendar-day-name">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const cellDate = new Date(viewYear, viewMonth, day);
          const todayNormalized = new Date();
          todayNormalized.setHours(0, 0, 0, 0);

          const maxDate = new Date(todayNormalized);
          maxDate.setDate(maxDate.getDate() + 10);

          const isToday = cellDate.getTime() === todayNormalized.getTime();
          const isSelected = selectedDate === dateStr;
          const isPast = cellDate < todayNormalized;
          const isTooFarFuture = cellDate > maxDate;
          
          const isAvailable = availableDates.length === 0 
            ? (!isPast && !isTooFarFuture) 
            : (availableDates.includes(dateStr) && !isTooFarFuture);

          let cls = 'calendar-day';
          if (isSelected) cls += ' selected';
          if (isToday) cls += ' today';
          if (isPast || isTooFarFuture || !isAvailable) cls += ' disabled';
          if (isAvailable && !isPast && !isTooFarFuture) cls += ' available';

          return (
            <div
              key={dateStr}
              className={cls}
              onClick={() => !isPast && !isTooFarFuture && isAvailable && onSelect && onSelect(dateStr)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
