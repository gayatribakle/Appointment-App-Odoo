import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { service, provider, date, time } = location.state || {};

  const [payMethod, setPayMethod] = useState('card');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [loading, setLoading] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/book/confirmation', { state: { service, provider, date, time } });
    }, 1500);
  };

  const price   = service?.price || 0;
  const tax     = Math.round(price * 0.18);
  const total   = price + tax;

  const payMethods = [
    { id: 'card',       label: '💳  Card'        },
    { id: 'upi',        label: '📱  UPI'          },
    { id: 'netbanking', label: '🏦  Net Banking'  },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/book/intake', { state: { service, provider, date, time } })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 14 }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Book Your Appointment</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Home / Book / Payment</div>
            </div>
          </div>
          <Stepper currentStep={6} />
        </div>

        <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Payment form */}
          <div className="card">
            <div className="card-title">Payment Details</div>

            {/* Method tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {payMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${payMethod === m.id ? '#4f46e5' : '#e5e7eb'}`,
                    background: payMethod === m.id ? '#eef2ff' : '#fff',
                    color: payMethod === m.id ? '#4f46e5' : '#374151',
                    fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {payMethod === 'card' && (
              <form onSubmit={handlePay}>
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <input
                    className="form-input" placeholder="1234 5678 9012 3456" maxLength={19}
                    value={card.number}
                    onChange={(e) => {
                      let v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      v = v.replace(/(.{4})/g, '$1 ').trim();
                      setCard({ ...card, number: v });
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cardholder Name</label>
                  <input className="form-input" placeholder="Jane Doe"
                    value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Expiry Date</label>
                    <input className="form-input" placeholder="MM / YY" maxLength={7}
                      value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV</label>
                    <input className="form-input" placeholder="•••" type="password" maxLength={4}
                      value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
                  {loading ? 'Processing…' : `Pay ₹${total}`}
                </button>
              </form>
            )}

            {payMethod === 'upi' && (
              <form onSubmit={handlePay}>
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input className="form-input" placeholder="yourname@upi" />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing…' : `Pay ₹${total} via UPI`}
                </button>
              </form>
            )}

            {payMethod === 'netbanking' && (
              <form onSubmit={handlePay}>
                <div className="form-group">
                  <label className="form-label">Select Bank</label>
                  <select className="form-input">
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Redirecting…' : `Pay ₹${total} via Net Banking`}
                </button>
              </form>
            )}

            <div style={{ marginTop: 16, fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
              🔒 Secured by 256-bit SSL encryption
            </div>
          </div>

          {/* Order summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-title">Order Summary</div>
              <div className="summary-row">
                <span className="label">Service</span>
                <span className="value">{service?.name || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Provider</span>
                <span className="value">{provider?.name || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Date & Time</span>
                <span className="value" style={{ fontSize: 13 }}>{date || '—'}, {time || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="label">Duration</span>
                <span className="value">{service?.duration || '—'} min</span>
              </div>
              <div className="divider" />
              <div className="summary-row">
                <span className="label">Subtotal</span>
                <span className="value">₹{price}</span>
              </div>
              <div className="summary-row">
                <span className="label">GST (18%)</span>
                <span className="value">₹{tax}</span>
              </div>
              <div className="summary-row" style={{ paddingTop: 12 }}>
                <span className="label" style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span className="value summary-total" style={{ color: '#4f46e5' }}>₹{total}</span>
              </div>
            </div>

            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac',
              borderRadius: 10, padding: '14px 16px', fontSize: 13, color: '#166534',
            }}>
              ✅ Free cancellation up to 24 hours before your appointment.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
