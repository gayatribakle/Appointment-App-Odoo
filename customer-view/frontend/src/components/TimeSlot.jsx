import React from 'react';

export default function TimeSlot({ slots = [], selected, onSelect }) {
  return (
    <div className="time-slots-grid">
      {slots.map((slot) => {
        let cls = 'time-slot ';
        if (slot.booked) cls += 'booked';
        else if (selected === slot.time) cls += 'selected';
        else cls += 'available';

        return (
          <div
            key={slot.time}
            className={cls}
            onClick={() => !slot.booked && onSelect && onSelect(slot.time)}
          >
            {slot.time}
            {slot.booked && <div style={{ fontSize: 10, marginTop: 2, color: 'var(--text-secondary)' }}>Full</div>}
          </div>
        );
      })}
    </div>
  );
}
