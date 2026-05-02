import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Check, X, Eye } from 'lucide-react';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selected, setSelected] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getAdminAllServices(filter).then((d: any) => setServices(d)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleApprove = async (id: number) => {
    if (!confirm('Approve this service?')) return;
    setActionLoading(true);
    try {
      await api.approveService(id);
      load();
    } finally { setActionLoading(false); }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setActionLoading(true);
    try {
      await api.rejectService(selected.id, reason);
      setSelected(null);
      setReason('');
      load();
    } finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Service Approvals</h1>
        <p className="page-subtitle">Review and manage service status.</p>
      </div>

      <div className="chip-group" style={{ marginBottom: 20 }}>
        {['PENDING', 'ACTIVE', 'REJECTED'].map(s => (
          <button key={s} className={`chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th><th>Organizer</th><th>Duration</th><th>Price (₹)</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>No services found</td></tr>}
                {services.map((svc: any) => (
                  <tr key={svc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{svc.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{svc.id}</div>
                    </td>
                    <td>{svc.organizer_name}</td>
                    <td>{svc.duration_mins} mins</td>
                    <td>₹{parseFloat(svc.advance_payment).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${svc.status.toLowerCase()}`}>{svc.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {svc.status === 'PENDING' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleApprove(svc.id)} disabled={actionLoading}>
                              <Check size={14} /> Approve
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => setSelected(svc)} disabled={actionLoading}>
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                        <button className="btn btn-sm btn-secondary" onClick={() => alert('View Details implementation')}>
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Service</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleReject}>
              <div className="form-group">
                <label className="form-label">Rejection Reason</label>
                <textarea className="form-textarea" value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Explain why this service was rejected..." required />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn btn-danger" disabled={actionLoading}>Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
