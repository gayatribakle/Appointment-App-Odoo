import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';
import Calendar from '../components/Calendar';

export default function SelectDate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, provider } = location.state || {};
  const [selectedDate, setSelectedDate] = useState('');

  const handleNext = () => {
    if (!selectedDate) return;
    navigate('/book/time', { state: { service, provider, date: selectedDate } });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header with stepper */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid #e5e7eb', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/book', { state: { service } })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Book Your Appointment</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Home / Book / Select Date</div>
            </div>
          </div>
          <Stepper currentStep={3} />
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Calendar */}
          <div className="card">
            <div className="card-title">Choose an Available Date</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Select a date for your appointment. You can book for today or any date within the next 10 days.
            </p>
            <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />

            <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: 'var(--primary)', borderRadius: 3, display: 'inline-block' }} />
                Selected
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, border: '2px solid #4f46e5', borderRadius: 3, display: 'inline-block' }} />
                Today
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, background: 'var(--border)', borderRadius: 3, display: 'inline-block' }} />
                Unavailable
              </span>
            </div>

            <div className="step-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => navigate('/book', { state: { service } })}>← Back</button>
              <button
                className="btn btn-primary"
                style={{ width: 'auto', padding: '10px 32px' }}
                disabled={!selectedDate}
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
              <span className="label">Duration</span>
              <span className="value">{service?.duration || '—'} min</span>
            </div>
            <div className="summary-row">
              <span className="label">Date</span>
              <span className="value" style={{ color: 'var(--primary)' }}>{selectedDate || 'Not selected'}</span>
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
