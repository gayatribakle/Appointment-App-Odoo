import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';
import TimeSlot from '../components/TimeSlot';

const ALL_SLOTS = [
  { time: '9:00 AM', booked: false },
  { time: '9:30 AM', booked: true  },
  { time: '10:00 AM', booked: false },
  { time: '10:30 AM', booked: false },
  { time: '11:00 AM', booked: true  },
  { time: '11:30 AM', booked: false },
  { time: '12:00 PM', booked: true  },
  { time: '12:30 PM', booked: false },
  { time: '2:00 PM',  booked: false },
  { time: '2:30 PM',  booked: false },
  { time: '3:00 PM',  booked: true  },
  { time: '3:30 PM',  booked: false },
  { time: '4:00 PM',  booked: false },
  { time: '4:30 PM',  booked: true  },
  { time: '5:00 PM',  booked: false },
  { time: '5:30 PM',  booked: false },
];

export default function SelectTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, provider, date } = location.state || {};
  const [selectedTime, setSelectedTime] = useState('');

  const handleNext = () => {
    if (!selectedTime) return;
    navigate('/book/intake', { state: { service, provider, date, time: selectedTime } });
  };

  const amSlots = ALL_SLOTS.filter(s => s.time.includes('AM'));
  const pmSlots = ALL_SLOTS.filter(s => s.time.includes('PM'));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid #e5e7eb', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/book/date', { state: { service, provider } })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Book Your Appointment</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Home / Book / Select Time</div>
            </div>
          </div>
          <Stepper currentStep={4} />
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Slots */}
          <div className="card">
            <div className="card-title">Select a Time Slot</div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 13 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: 'var(--primary)', borderRadius: 3, display: 'inline-block' }} />
                Selected
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, border: '1px solid #e5e7eb', borderRadius: 3, display: 'inline-block' }} />
                Available ({ALL_SLOTS.filter(s => !s.booked).length})
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: 'var(--bg)', borderRadius: 3, display: 'inline-block' }} />
                Booked ({ALL_SLOTS.filter(s => s.booked).length})
              </span>
            </div>

            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>🌅 Morning</div>
            <TimeSlot slots={amSlots} selected={selectedTime} onSelect={setSelectedTime} />

            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', margin: '16px 0 8px' }}>☀️ Afternoon & Evening</div>
            <TimeSlot slots={pmSlots} selected={selectedTime} onSelect={setSelectedTime} />

            <div className="step-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => navigate('/book/date', { state: { service, provider } })}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 32px' }}
                disabled={!selectedTime}
                onClick={handleNext}
              >
                Next →
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="card" style={{ height: 'fit-content' }}>
            <div className="card-title">Booking Summary</div>
            <div className="summary-row">
              <span className="label">Service</span>
              <span className="value">{service?.name || '—'}</span>
            </div>
            <div className="summary-row">
              <span className="label">Provider</span>
              <span className="value">{provider?.name || '—'}</span>
            </div>
            <div className="summary-row">
              <span className="label">Date</span>
              <span className="value">{date || '—'}</span>
            </div>
            <div className="summary-row">
              <span className="label">Time</span>
              <span className="value" style={{ color: 'var(--primary)' }}>{selectedTime || 'Not selected'}</span>
            </div>
            <div className="summary-row">
              <span className="label">Price</span>
              <span className="value summary-total">₹{service?.price || '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
