import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { Clock, Calendar, Video } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getUserBookings(filter).then((d: any) => setBookings(d)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setActionLoading(true);
    try {
      await api.userCancelBooking(id);
      load();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Track and manage your upcoming appointments.</p>
      </div>

      <div className="chip-group" style={{ marginBottom: 24 }}>
        {['', 'pending', 'confirmed', 'cancelled', 'completed'].map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === '' ? 'ALL' : s.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bookings.map((b: any) => (
            <div key={b.id} className="card" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 12, background: 'var(--surface2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {format(new Date(b.slot_date), 'MMM')}
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>{format(new Date(b.slot_date), 'd')}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{b.service_title}</h3>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14} /> {b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={14} /> {b.organizer_name}
                    {b.provider_name && <span> / {b.provider_name}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Ref: {b.reference_code}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>₹{parseFloat(b.payment_amount).toLocaleString('en-IN')}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Payment: {b.payment_status}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {b.meeting_type === 'ONLINE' && ['pending', 'confirmed'].includes(b.status) && (
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={() => window.location.href=`/meeting/${b.id}`}
                  >
                    <Video size={14} /> Join Meeting
                  </button>
                )}
                {b.pre_meeting_needed && b.pre_meeting_type === 'ONLINE' && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => window.open(b.pre_meeting_link, '_blank')}
                  >
                    <Video size={14} /> Join Pre-Consultation
                  </button>
                )}
                {['pending', 'confirmed'].includes(b.status) && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCancel(b.id)} disabled={actionLoading}>
                    Cancel
                  </button>
                )}
              </div>
              {b.pre_meeting_needed && (
                <div style={{ 
                  marginTop: 12, padding: '10px 14px', background: 'var(--surface2)', 
                  borderRadius: 8, fontSize: '0.8rem', border: '1px solid var(--border)',
                  color: 'var(--primary)', fontWeight: 600
                }}>
                  📅 Pre-Consultation: {format(new Date(b.pre_meeting_time), 'dd MMM, hh:mm a')} ({b.pre_meeting_type})
                </div>
              )}
            </div>
          ))}
          {bookings.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'var(--card-bg)', borderRadius: 16, border: '1px dashed var(--border)' }}>
              <Clock size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>No bookings found for this category.</p>
              <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => window.location.href='/home'}>
                Browse Services
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
