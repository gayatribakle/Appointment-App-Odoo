import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { format } from 'date-fns';
import { XCircle, Filter } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', from: '', to: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getAdminAllBookings(filter as any).then((d: any) => setBookings(d)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Force cancel this booking? This will free up the slot.')) return;
    setActionLoading(true);
    try {
      await api.adminCancelBooking(id);
      load();
    } finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Global Bookings</h1>
        <p className="page-subtitle">Monitor all system appointments.</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={filter.status} onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From</label>
            <input type="date" className="form-input" value={filter.from} onChange={e => setFilter(f => ({ ...f, from: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">To</label>
            <input type="date" className="form-input" value={filter.to} onChange={e => setFilter(f => ({ ...f, to: e.target.value }))} />
          </div>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            <Filter size={18} /> Apply
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking</th><th>Service / Organizer</th><th>Date & Time</th><th>Payment</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.customer_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.reference_code}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.88rem' }}>{b.service_title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {b.organizer_name}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{format(new Date(b.slot_date), 'MMM d, yyyy')}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}</div>
                    </td>
                    <td>
                      {b.payment_amount > 0 ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>₹{parseFloat(b.payment_amount).toLocaleString('en-IN')}</div>
                          <span className={`badge badge-${b.payment_status === 'paid' ? 'confirmed' : 'pending'}`}>{b.payment_status}</span>
                        </div>
                      ) : 'Free'}
                    </td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleCancel(b.id)} disabled={actionLoading}>
                          <XCircle size={14} /> Force Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
