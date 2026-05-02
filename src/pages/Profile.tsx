import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  useEffect(() => {
    api.getProfile().then((d: any) => {
      setProfile(d);
      setForm({ name: d.name });
    });
    if (user?.role === 'user') {
      api.getUserBookings().then((d: any) => setRecentBookings(d.slice(0, 5)));
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(''); setError(''); setSaving(true);
    try {
      await api.updateProfile(form);
      setSuccess('Profile updated successfully!');
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your account details and preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', fontWeight: 700
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{profile?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{profile?.email}</div>
              <span className={`badge badge-${user?.role === 'admin' ? 'rejected' : user?.role === 'organizer' ? 'confirmed' : 'pending'}`} style={{ marginTop: 6 }}>
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>

          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={profile?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed for security reasons.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Member Since</label>
              <input className="form-input" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {user?.role === 'user' && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>Recent Bookings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentBookings.map(b => (
                <div key={b.id} style={{ padding: 12, background: 'var(--surface2)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.service_title}</span>
                    <span className={`badge badge-${b.status}`} style={{ fontSize: '0.65rem' }}>{b.status}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(b.slot_date).toLocaleDateString()} at {b.start_time.slice(0, 5)}
                  </div>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: 20 }}>No booking history found.</p>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => window.location.href='/my-bookings'}>View All History</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
