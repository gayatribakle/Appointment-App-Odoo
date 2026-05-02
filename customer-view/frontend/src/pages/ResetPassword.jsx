import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1000);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">📋</div>
          <span>AppointEase</span>
        </div>

        {!sent ? (
          <>
            <h1 className="auth-title">Reset your password</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reset-email">Email address</label>
                <input
                  id="reset-email"
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
            <h1 className="auth-title">Check your inbox</h1>
            <p className="auth-subtitle">
              We sent a password reset link to <strong>{email}</strong>.
              Please check your email.
            </p>
            <div className="alert alert-success" style={{ marginTop: 20 }}>
              ✅ Reset link sent successfully!
            </div>
          </div>
        )}

        <p className="text-center mt-4" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Remember your password?{' '}
          <span className="link" onClick={() => navigate('/login')}>Back to login</span>
        </p>
      </div>
    </div>
  );
}
