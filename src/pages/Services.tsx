import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Pencil, Trash2, Globe, Lock, Zap, Clock, X, Check } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const emptyService = {
  title: '', description: '', duration_mins: 30, type: 'user',
  max_bookings_per_slot: 1, advance_payment: 0,
  auto_confirm: true, auto_assign_provider: true,
  start_date: '', end_date: ''
};

const emptyRule = { day_of_week: 1, start_time: '09:00', end_time: '17:00', slot_interval_mins: 30 };

export default function Services() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyService);
  const [rules, setRules] = useState<any[]>([{ ...emptyRule }]);
  const [saving, setSaving] = useState(false);
  const [genLoading, setGenLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.getServices().then((d: any) => setServices(d)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(emptyService); setRules([{ ...emptyRule }]); setShowModal(true); };
  const openEdit = async (svc: any) => {
    const detail: any = await api.getServiceById(svc.id);
    setEditing(detail);
    setForm({ 
      title: detail.title, description: detail.description, duration_mins: detail.duration_mins, type: detail.type, 
      max_bookings_per_slot: detail.max_bookings_per_slot, advance_payment: detail.advance_payment, 
      auto_confirm: detail.auto_confirm, auto_assign_provider: detail.auto_assign_provider,
      start_date: detail.start_date ? detail.start_date.split('T')[0] : '',
      end_date: detail.end_date ? detail.end_date.split('T')[0] : ''
    });
    setRules(detail.availability_rules?.length ? detail.availability_rules : [{ ...emptyRule }]);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    
    try {
      // Basic Validations
      if (form.start_date && form.end_date) {
        if (new Date(form.end_date) < new Date(form.start_date)) {
          throw new Error('End date cannot be before start date.');
        }
      }

      if (!editing) {
        for (const rule of rules) {
          if (rule.end_time <= rule.start_time) {
            throw new Error(`Invalid time range for ${DAYS[rule.day_of_week]}. End time must be after start time.`);
          }
        }
      }

      if (editing) {
        await api.updateService(editing.id, form);
      } else {
        await api.createService({ ...form, availability_rules: rules });
      }
      setShowModal(false); load();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return;
    await api.deleteService(id); load();
  };

  const handleTogglePublish = async (id: number) => {
    await api.togglePublish(id); load();
  };

  const handleGenerateSlots = async (id: number) => {
    setGenLoading(id);
    try {
      const res: any = await api.generateSlots({ service_id: id, days_ahead: 30 });
      alert(res.message);
    } catch (err: any) { alert('Error: ' + err.message); }
    finally { setGenLoading(null); }
  };

  const addRule = () => setRules(r => [...r, { ...emptyRule }]);
  const removeRule = (i: number) => setRules(r => r.filter((_: any, idx: number) => idx !== i));
  const updateRule = (i: number, field: string, value: any) => setRules(r => r.map((rule: any, idx: number) => idx === i ? { ...rule, [field]: value } : rule));

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Services</h1>
          <p className="page-subtitle">Manage your appointment services and availability</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> New Service</button>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {services.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
              <Zap size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No services yet. Create your first service!</p>
            </div>
          )}
          {services.map((svc: any) => (
            <div key={svc.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{svc.title}</h3>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${svc.status.toLowerCase()}`}>
                      {svc.status === 'PENDING' && <Clock size={10} />}
                      {svc.status === 'ACTIVE' && <Check size={10} />}
                      {svc.status === 'REJECTED' && <X size={10} />}
                      {svc.status}
                    </span>
                    {svc.status === 'ACTIVE' && (
                      <span className={`badge ${svc.is_published ? 'badge-published' : 'badge-draft'}`}>
                        {svc.is_published ? <><Globe size={10} /> Published</> : <><Lock size={10} /> Draft</>}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-icon btn-secondary" onClick={() => openEdit(svc)}><Pencil size={15} /></button>
                  <button className="btn btn-icon btn-danger" onClick={() => handleDelete(svc.id)}><Trash2 size={15} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span><Clock size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {svc.duration_mins} mins</span>
                <span>₹{parseFloat(svc.advance_payment).toLocaleString('en-IN')} advance</span>
              </div>

              {svc.status === 'REJECTED' && svc.rejection_reason && (
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, fontSize: '0.78rem', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <strong>Rejection Reason:</strong> {svc.rejection_reason}
                </div>
              )}

              {svc.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{svc.description}</p>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {svc.status === 'ACTIVE' ? (
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => handleTogglePublish(svc.id)}>
                    {svc.is_published ? <><Lock size={13} /> Unpublish</> : <><Globe size={13} /> Publish</>}
                  </button>
                ) : (
                  <button className="btn btn-sm btn-secondary" style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }} disabled title="Waiting for admin approval">
                    <Lock size={13} /> Publish (Locked)
                  </button>
                )}
                <button className="btn btn-sm btn-primary" style={{ flex: 1 }} disabled={genLoading === svc.id || svc.status !== 'ACTIVE'} onClick={() => handleGenerateSlots(svc.id)}>
                  <Zap size={13} /> {genLoading === svc.id ? 'Generating...' : 'Gen Slots'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Edit Service' : 'Create Service'}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Service Title *</label>
                <input className="form-input" value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} required placeholder="e.g. Hair Cut, Consultation" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="Brief description..." style={{ minHeight: 70 }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input className="form-input" type="number" min={5} value={form.duration_mins} onChange={e => setForm((f: any) => ({ ...f, duration_mins: parseInt(e.target.value) }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}>
                    <option value="user">User Based</option>
                    <option value="resource">Resource Based</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date (Optional)</label>
                  <input className="form-input" type="date" value={form.start_date || ''} onChange={e => setForm((f: any) => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date (Optional)</label>
                  <input className="form-input" type="date" value={form.end_date || ''} onChange={e => setForm((f: any) => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Bookings/Slot</label>
                  <input className="form-input" type="number" min={1} value={form.max_bookings_per_slot} onChange={e => setForm((f: any) => ({ ...f, max_bookings_per_slot: parseInt(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Advance Payment (₹)</label>
                  <input className="form-input" type="number" min={0} step={0.01} value={form.advance_payment} onChange={e => setForm((f: any) => ({ ...f, advance_payment: parseFloat(e.target.value) }))} />
                </div>
              </div>
              <div className="form-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="auto_confirm" checked={form.auto_confirm} onChange={e => setForm((f: any) => ({ ...f, auto_confirm: e.target.checked }))} />
                  <label htmlFor="auto_confirm" className="form-label" style={{ marginBottom: 0 }}>Auto Confirm</label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="checkbox" id="auto_assign" checked={form.auto_assign_provider} onChange={e => setForm((f: any) => ({ ...f, auto_assign_provider: e.target.checked }))} />
                  <label htmlFor="auto_assign" className="form-label" style={{ marginBottom: 0 }}>Auto Assign Provider</label>
                </div>
              </div>

              {/* Availability Rules */}
              {!editing && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Availability Rules</label>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={addRule}><Plus size={13} /> Add Rule</button>
                  </div>
                  {rules.map((rule: any, i: number) => (
                    <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: 14, marginBottom: 10, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                        <div>
                          <label className="form-label">Day</label>
                          <select className="form-select" value={rule.day_of_week} onChange={e => updateRule(i, 'day_of_week', parseInt(e.target.value))}>
                            {DAYS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Start</label>
                          <input className="form-input" type="time" value={rule.start_time} onChange={e => updateRule(i, 'start_time', e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">End</label>
                          <input className="form-input" type="time" value={rule.end_time} onChange={e => updateRule(i, 'end_time', e.target.value)} />
                        </div>
                        <div>
                          <label className="form-label">Interval (min)</label>
                          <input className="form-input" type="number" min={5} value={rule.slot_interval_mins} onChange={e => updateRule(i, 'slot_interval_mins', parseInt(e.target.value))} />
                        </div>
                        <button type="button" className="btn btn-icon btn-danger" onClick={() => removeRule(i)}><X size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
