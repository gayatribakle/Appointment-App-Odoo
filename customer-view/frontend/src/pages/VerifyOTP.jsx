import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.join('').length < 6) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/dashboard'); }, 1000);
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">📋</div>
          <span>AppointEase</span>
        </div>
        <h1 className="auth-title">Verify your email</h1>
        <p className="auth-subtitle">
          We sent a 6-digit code to your email address. Enter it below to verify.
        </p>

        {resent && <div className="alert alert-success">✅ OTP resent successfully!</div>}

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((val, idx) => (
              <input
                key={idx}
                ref={(el) => (inputs.current[idx] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              />
            ))}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || otp.join('').length < 6}
          >
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <p className="text-center mt-4" style={{ fontSize: 14, color: '#6b7280' }}>
          Didn't receive the code?{' '}
          <span className="link" onClick={handleResend}>Resend OTP</span>
        </p>
        <p className="text-center mt-2">
          <span className="link" onClick={() => navigate('/login')}>← Back to login</span>
        </p>
      </div>
    </div>
  );
}
