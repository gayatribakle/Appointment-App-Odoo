import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';

export default function IntakeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, provider, date, time } = location.state || {};

  const [form, setForm] = useState({
    fullName: '', dob: '', phone: '', gender: '',
    address: '', reason: '', allergies: '', notes: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.reason) return;
    navigate('/book/payment', { state: { service, provider, date, time, intake: form } });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid #e5e7eb', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/book/time', { state: { service, provider, date } })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14 }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Book Your Appointment</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Home / Book / Intake Form</div>
            </div>
          </div>
          <Stepper currentStep={5} />
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Form */}
          <div className="card">
            <div className="card-title">Patient Information</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 22 }}>
              Please fill in the required details before your appointment.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input name="fullName" className="form-input" placeholder="Jane Doe"
                    value={form.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input name="dob" type="date" className="form-input"
                    value={form.dob} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input name="phone" className="form-input" placeholder="+91 9876543210"
                    value={form.phone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-input" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input name="address" className="form-input" placeholder="123 Main St, City"
                  value={form.address} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Visit *</label>
                <textarea
                  name="reason" className="form-input" rows={3}
                  placeholder="Describe your symptoms or reason for booking..."
                  value={form.reason} onChange={handleChange} style={{ resize: 'vertical' }} required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Known Allergies</label>
                  <input name="allergies" className="form-input" placeholder="e.g. Penicillin, Nuts"
                    value={form.allergies} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Notes</label>
                  <input name="notes" className="form-input" placeholder="Any other info for the provider"
                    value={form.notes} onChange={handleChange} />
                </div>
              </div>

              <div className="step-actions" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-outline"
                  onClick={() => navigate('/book/time', { state: { service, provider, date } })}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 32px' }}>
                  Next: Payment →
                </button>
              </div>
            </form>
          </div>

          {/* Summary sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Appointment Summary</div>
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
                <span className="value">{time || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Amount</span>
                <span className="value summary-total">₹{service?.price || '—'}</span>
              </div>
            </div>

            <div style={{
              background: '#fffbeb', border: '1px solid #fcd34d',
              borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#92400e',
            }}>
              ℹ️ <strong>Note:</strong> Your intake form information is kept confidential and only shared with your provider.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
