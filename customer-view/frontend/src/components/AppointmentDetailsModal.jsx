import React from 'react';

export default function AppointmentDetailsModal({ appointment, onClose }) {
  if (!appointment) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card" style={{
        width: '90%', maxWidth: 450, background: 'var(--bg)', position: 'relative',
        padding: 0, overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--white)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Appointment Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
        </div>
        
        <div style={{ padding: '24px', background: 'var(--white)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              📋
            </div>
          </div>
          
          <h3 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{appointment.service}</h3>
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>{appointment.id}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="summary-row">
              <span className="label">Provider</span>
              <span className="value">{appointment.provider}</span>
            </div>
            <div className="summary-row">
              <span className="label">Date & Time</span>
              <span className="value">{appointment.date} at {appointment.time}</span>
            </div>
            <div className="summary-row">
              <span className="label">Duration</span>
              <span className="value">{appointment.duration} mins</span>
            </div>
            <div className="summary-row">
              <span className="label">Amount Paid</span>
              <span className="value" style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{appointment.price}</span>
            </div>
            <div className="summary-row">
              <span className="label">Status</span>
              <span className="value" style={{ textTransform: 'capitalize' }}>
                <span className={`badge badge-${appointment.status === 'confirmed' ? 'indigo' : appointment.status === 'completed' ? 'green' : 'error'}`} style={{
                  background: appointment.status === 'cancelled' ? '#fee2e2' : undefined,
                  color: appointment.status === 'cancelled' ? '#991b1b' : undefined
                }}>
                  {appointment.status}
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '16px 24px', background: 'var(--bg)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
