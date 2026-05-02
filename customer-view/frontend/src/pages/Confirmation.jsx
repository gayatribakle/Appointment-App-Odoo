import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, provider, date, time, payMethod } = location.state || {};

  const bookingId = `APT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const total = service ? Math.round(service.price * 1.18) : 0;
  const isOffline = payMethod === 'offline';

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Booking Confirmed" subtitle="Home / Book / Confirmation" />
        <div className="page-content">
          <div style={{ maxWidth: 600, margin: '0 auto' }}>

            {/* Success Banner */}
            <div className="card text-center" style={{ marginBottom: 20 }}>
              <div className="confirmation-icon">✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                Appointment Confirmed!
              </h2>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
                Your booking has been successfully confirmed. A confirmation has been sent to your email.
              </p>
              <span className="badge badge-indigo" style={{ fontSize: 13, padding: '4px 14px' }}>
                Booking ID: {bookingId}
              </span>
            </div>

            {/* Booking Details */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">Booking Details</div>
              <div className="summary-row">
                <span className="label">📋 Service</span>
                <span className="value">{service?.name || 'General Consultation'}</span>
              </div>
              <div className="summary-row">
                <span className="label">👤 Provider</span>
                <span className="value">{provider?.name || 'Dr. Priya Sharma'}</span>
              </div>
              <div className="summary-row">
                <span className="label">📅 Date</span>
                <span className="value">{date || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">⏰ Time</span>
                <span className="value">{time || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">⏱ Duration</span>
                <span className="value">{service?.duration || '—'} min</span>
              </div>
              <div className="summary-row">
                <span className="label">💰 Payment</span>
                <span className="value summary-total" style={{ color: isOffline ? '#d97706' : '#10b981' }}>
                  {isOffline ? `₹${total} (Due at Hospital)` : `₹${total} (Paid)`}
                </span>
              </div>
              <div className="summary-row">
                <span className="label">📍 Status</span>
                <span className="badge badge-green">Confirmed</span>
              </div>
            </div>

            {/* Reminder */}
            <div className="card" style={{ background: 'var(--primary-bg)', borderColor: 'var(--border)', marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: 'var(--text)' }}>
                <strong>📌 Reminder:</strong> Please arrive 10 minutes before your scheduled appointment time.
                <br/><br/>
                <strong>Policy:</strong> You cannot cancel the appointment within 2 hours of the scheduled time. Rescheduling must be done at least 6 hours in advance.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => navigate('/dashboard')}
              >
                🏠 Back to Dashboard
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => navigate('/book')}
              >
                ➕ Book Another
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
