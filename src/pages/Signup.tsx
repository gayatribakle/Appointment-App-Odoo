import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { api } from '../services/api';
import { UserPlus } from 'lucide-react';

type Step = 'signup' | 'verify' | 'success';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('signup');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    
    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      await api.signup(form);
      setSuccess(`Account created! OTP sent to your email (check server terminal for simulated).`);
      setStep('verify');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.verifyOtp({ email: form.email, otp });
      setStep('success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-logo">📅 BookSync</span>

        {step === 'signup' ? (
          <>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Start managing appointments today</p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Jane Smith"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">I want to...</label>
                <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="user">Book Appointments (User)</option>
                  <option value="organizer">Offer Services (Organizer)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
                <UserPlus size={18} /> {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          </>
        ) : step === 'verify' ? (
          <>
            <h1 className="auth-title">Verify your email</h1>
            <p className="auth-subtitle">Enter the OTP shown in the server console</p>
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label className="form-label">OTP Code</label>
                <input className="form-input" type="text" placeholder="123456" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value)} required
                  style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.3em' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h1 className="auth-title">Success!</h1>
            <p className="auth-subtitle">Email verified. Redirecting to login...</p>
            <div className="alert alert-success">Verification successful!</div>
          </div>
        )}

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
