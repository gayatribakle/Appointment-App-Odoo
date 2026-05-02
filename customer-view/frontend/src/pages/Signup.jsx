import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/verify-otp'); }, 1000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Left – gradient illustration panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.15)', top: -80, left: -80,
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.1)', bottom: -40, right: -40,
        }} />

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48, alignSelf: 'flex-start' }}>
          <div style={{
            width: 36, height: 36, background: 'rgba(255,255,255,0.2)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>📋</div>
          <span style={{ fontWeight: 700, fontSize: 18 }}>AppointEase</span>
        </div>

        {/* 3-D style calendar illustration */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 20,
          padding: '32px 40px',
          marginBottom: 36,
          textAlign: 'center',
          border: '1px solid rgba(255,255,255,0.2)',
          width: '100%',
          maxWidth: 320,
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🗓️</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Frictionless Scheduling</div>
          <div style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.6 }}>
            Book appointments with your favourite providers in just a few clicks.
          </div>
        </div>

        {/* Feature bullets */}
        {['Smart availability matching', 'Instant confirmations', 'Zero double-bookings'].map((f) => (
          <div key={f} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 12, alignSelf: 'flex-start', maxWidth: 320,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, flexShrink: 0,
            }}>✓</div>
            <span style={{ fontSize: 14, opacity: 0.9 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right – form panel */}
      <div style={{
        width: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 48px',
        background: 'var(--white)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            Create account
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Already have an account?{' '}
            <span className="link" onClick={() => navigate('/login')}>Sign in</span>
          </p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" className="form-input"
                placeholder="Jane Doe" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" className="form-input"
                placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-input"
                placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 20 }}>
            By creating an account you agree to our{' '}
            <span className="link" style={{ fontSize: 12 }}>Terms of Service</span>
            {' '}and{' '}
            <span className="link" style={{ fontSize: 12 }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
