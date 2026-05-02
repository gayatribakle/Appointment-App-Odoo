import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Filter, X, Video } from 'lucide-react';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'rejected', 'cancelled', 'rescheduled'];

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', service_id: '' });
  const [selected, setSelected] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = (f = filters) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (f.status) params.status = f.status;
    if (f.service_id) params.service_id = f.service_id;
    api.getBookings(params).then((d: any) => setBookings(d)).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.getServices().then((d: any) => setServices(d));
    load();
  }, []);

  const openDetail = async (id: number) => {
    const data = await api.getBookingById(id);
    setSelected(data);
  };

  const handleStatus = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      await api.updateBookingStatus(id, status);
      setSelected(null);
      load();
    } finally { setActionLoading(false); }
  };

  const getBadge = (status: string) => <span className={`badge badge-${status}`}>{status}</span>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bookings</h1>
        <p className="page-subtitle">Manage all your appointment bookings</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label className="form-label"><Filter size={13} style={{ display: 'inline' }} /> Status</label>
          <select className="form-select" value={filters.status}
            onChange={e => { const v = e.target.value; setFilters(f => ({ ...f, status: v })); load({ ...filters, status: v }); }}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Service</label>
          <select className="form-select" value={filters.service_id}
            onChange={e => { const v = e.target.value; setFilters(f => ({ ...f, service_id: v })); load({ ...filters, service_id: v }); }}>
            <option value="">All Services</option>
            {services.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <button className="btn btn-secondary" onClick={() => { setFilters({ status: '', service_id: '' }); load({ status: '', service_id: '' }); }}>
          <X size={15} /> Clear
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#ID</th><th>Customer</th><th>Service</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No bookings found</td></tr>
                )}
                {bookings.map((b: any) => (
                  <tr key={b.id}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer_name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.customer_email}</div>
                    </td>
                    <td>{b.service_title}</td>
                    <td>{b.slot_date ? format(new Date(b.slot_date), 'dd MMM yyyy') : '—'}</td>
                    <td>{b.start_time?.slice(0, 5)} – {b.end_time?.slice(0, 5)}</td>
                    <td>{getBadge(b.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openDetail(b.id)}>View</button>
                        {b.meeting_type === 'ONLINE' && ['pending', 'confirmed'].includes(b.status) && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            onClick={() => window.location.href=`/meeting/${b.id}`}
                            title="Join Video Meeting"
                          >
                            <Video size={13} /> Join
                          </button>
                        )}
                        {b.status === 'pending' && <>
                          <button className="btn btn-sm btn-success" onClick={() => handleStatus(b.id, 'confirmed')}><CheckCircle size={13} /></button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatus(b.id, 'rejected')}><XCircle size={13} /></button>
                        </>}
                        {b.status === 'confirmed' && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleStatus(b.id, 'cancelled')}>Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Booking #{selected.id}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                ['Customer', selected.customer_name || 'N/A'],
                ['Email', selected.customer_email],
                ['Phone', selected.customer_phone || '—'],
                ['Service', selected.service_title],
                ['Date', selected.slot_date ? format(new Date(selected.slot_date), 'dd MMM yyyy') : '—'],
                ['Time', `${selected.start_time?.slice(0, 5)} – ${selected.end_time?.slice(0, 5)}`],
                ['Status', ''],
                ['Payment', selected.payment_status || 'None'],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                  {label === 'Status' ? getBadge(selected.status) : <div style={{ fontWeight: 600 }}>{value}</div>}
                </div>
              ))}
            </div>
            {selected.payment_amount && (
              <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14, marginBottom: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Payment Amount</div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>₹{parseFloat(selected.payment_amount).toLocaleString('en-IN')}</div>
              </div>
            )}
            {selected.pre_meeting_needed && (
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>Pre-Appointment Consultation</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Scheduled Time</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{format(new Date(selected.pre_meeting_time), 'dd MMM, hh:mm a')}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mode</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selected.pre_meeting_type}</div>
                  </div>
                </div>
                {selected.pre_meeting_type === 'ONLINE' && (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    style={{ marginTop: 12, width: '100%' }}
                    onClick={() => window.open(selected.pre_meeting_link, '_blank')}
                  >
                    <Video size={14} /> Join Consultation
                  </button>
                )}
              </div>
            )}
            {selected.responses?.length > 0 && (
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10 }}>Customer Responses</div>
                {selected.responses.map((r: any) => (
                  <div key={r.id} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.question_text}</div>
                    <div style={{ fontSize: '0.88rem' }}>{r.response_text}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
              {selected.meeting_type === 'ONLINE' && ['pending', 'confirmed'].includes(selected.status) && (
                <button 
                  className="btn btn-primary" 
                  onClick={() => window.location.href=`/meeting/${selected.id}`}
                >
                  <Video size={16} /> Join Meeting
                </button>
              )}
              {selected.status === 'pending' && <>
                <button className="btn btn-success" onClick={() => handleStatus(selected.id, 'confirmed')} disabled={actionLoading}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button className="btn btn-danger" onClick={() => handleStatus(selected.id, 'rejected')} disabled={actionLoading}>
                  <XCircle size={16} /> Reject
                </button>
              </>}
              {selected.status === 'confirmed' && (
                <button className="btn btn-danger" onClick={() => handleStatus(selected.id, 'cancelled')} disabled={actionLoading}>Cancel</button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
