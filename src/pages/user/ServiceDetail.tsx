import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../../services/api';
import { format, addDays, startOfDay } from 'date-fns';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ServiceDetail() {
  const { id } = useParams();
  console.log('🔍 ServiceDetail Rendering, ID:', id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [form, setForm] = useState<any>({ 
    customer_name: user?.name || '', 
    customer_email: user?.email || '', 
    customer_phone: '', 
    notes: '',
    meeting_type: 'OFFLINE',
    pre_meeting_needed: false,
    pre_meeting_type: 'OFFLINE',
    pre_meeting_time: ''
  });
  const [responses, setResponses] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<any>(null);

  useEffect(() => {
    console.log('📡 Fetching Service Detail for ID:', id);
    api.getServiceDetailPublic(Number(id))
      .then((d: any) => {
        console.log('✅ Service Data Received:', d);
        setService(d);
        setResponses(d.questions.map((q: any) => ({ question_id: q.id, response_text: '' })));
      })
      .catch(err => {
        console.error('❌ Service Fetch Error:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!service) return <div className="alert alert-error">Service not found</div>;

  const filteredSlots = service.available_slots.filter((s: any) => {
    // Robust date comparison: convert slot_date to local YYYY-MM-DD
    const sDate = new Date(s.slot_date).toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD
    const matchesDate = sDate === selectedDate;
    const matchesProvider = !selectedProvider || s.provider_id === selectedProvider.id;
    return matchesDate && matchesProvider;
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return alert('Please select a time slot');

    // Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customer_email)) {
      return alert('Please enter a valid email address.');
    }

    const phoneRegex = /^[0-9+()-\s]{10,}$/;
    if (!phoneRegex.test(form.customer_phone)) {
      return alert('Please enter a valid phone number (min 10 digits).');
    }

    setSubmitting(true);
    try {
      const res: any = await api.userCreateBooking({
        service_id: service.id,
        slot_id: selectedSlot.id,
        ...form,
        responses
      });
      setBooked(res);
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (booked) {
    return (
      <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: 40 }}>
          <CheckCircle2 size={64} color="#10b981" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 12 }}>Booking Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Your appointment for <strong>{service.title}</strong> has been scheduled.
          </p>
          <div style={{ background: 'var(--surface2)', padding: 20, borderRadius: 12, marginBottom: 32, textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Reference:</span>
              <span style={{ fontWeight: 600 }}>{booked.reference_code}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Date:</span>
              <span style={{ fontWeight: 600 }}>{format(new Date(selectedSlot.slot_date), 'MMMM d, yyyy')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: 'var(--text-muted)' }}>Time:</span>
              <span style={{ fontWeight: 600 }}>{selectedSlot.start_time.slice(0, 5)}</span>
            </div>
            {selectedSlot.provider_name && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Provider:</span>
                <span style={{ fontWeight: 600 }}>{selectedSlot.provider_name}</span>
              </div>
            )}
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/my-bookings')}>
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back to Services
      </button>

      <div className="grid-2">
        <div>
          <div className="card" style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>{service.title}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.6 }}>{service.description}</p>
            <div style={{ display: 'flex', gap: 24 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                <div style={{ fontWeight: 600 }}>{service.duration_mins} Minutes</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</div>
                <div style={{ fontWeight: 600 }}>₹{parseFloat(service.advance_payment).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organizer</div>
                <div style={{ fontWeight: 600 }}>{service.organizer_name}</div>
              </div>
            </div>
          </div>

          {service.providers?.length > 0 && (
            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>1. Select Provider / Resource</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className={`chip ${!selectedProvider ? 'active' : ''}`} onClick={() => { setSelectedProvider(null); setSelectedSlot(null); }}>
                  Any Provider
                </button>
                {service.providers.map((p: any) => (
                  <button key={p.id} className={`chip ${selectedProvider?.id === p.id ? 'active' : ''}`}
                    onClick={() => { setSelectedProvider(p); setSelectedSlot(null); }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>{service.providers?.length > 0 ? '2' : '1'}. Select Date & Time</h3>
            <div style={{ marginBottom: 24 }}>
              <label className="form-label">Available Dates</label>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                {[...Array(21)].map((_, i) => {
                  const d = addDays(startOfDay(new Date()), i);
                  
                  // Range check
                  if (service.start_date && d < startOfDay(new Date(service.start_date))) return null;
                  if (service.end_date && d > startOfDay(new Date(service.end_date))) return null;
                  
                  const ds = format(d, 'yyyy-MM-dd');
                  return (
                    <button key={ds} className={`chip ${selectedDate === ds ? 'active' : ''}`}
                      onClick={() => { setSelectedDate(ds); setSelectedSlot(null); }}
                      style={{ padding: '12px 16px', minWidth: 80, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>{format(d, 'EEE')}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{format(d, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="form-label">Available Slots</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {filteredSlots.map((s: any) => (
                  <button key={s.id} className={`chip ${selectedSlot?.id === s.id ? 'active' : ''}`}
                    onClick={() => setSelectedSlot(s)} style={{ padding: '10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{s.start_time.slice(0, 5)}</div>
                    {!selectedProvider && s.provider_name && <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{s.provider_name}</div>}
                  </button>
                ))}
                {filteredSlots.length === 0 && (
                  <div style={{ gridColumn: '1/-1', padding: '20px 0', textAlign: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                    {service.available_slots.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        📅 The organizer hasn't opened any slots for this service yet.
                      </p>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        ❌ No slots available for {format(new Date(selectedDate), 'EEEE, MMM d')}.
                        <br/><span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Try selecting another date above.</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <h3 style={{ marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>{service.providers?.length > 0 ? '3' : '2'}. Complete Booking</h3>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" value={form.customer_name} onChange={e => setForm((f: any) => ({ ...f, customer_name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={form.customer_email} onChange={e => setForm((f: any) => ({ ...f, customer_email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+91 XXXXX XXXXX" value={form.customer_phone} onChange={e => setForm((f: any) => ({ ...f, customer_phone: e.target.value }))} required />
              </div>



              <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <input type="checkbox" id="pre_meeting" checked={form.pre_meeting_needed} onChange={e => setForm((f: any) => ({ ...f, pre_meeting_needed: e.target.checked }))} />
                  <label htmlFor="pre_meeting" className="form-label" style={{ marginBottom: 0, fontWeight: 700, color: 'var(--primary)' }}>
                    I have doubts and need a consultation before the actual appointment
                  </label>
                </div>

                {form.pre_meeting_needed && (
                  <div style={{ paddingLeft: 26, display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
                    <div>
                      <label className="form-label">Consultation Mode</label>
                      <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input type="radio" name="pre_meeting_type" value="OFFLINE" checked={form.pre_meeting_type === 'OFFLINE'} onChange={e => setForm((f: any) => ({ ...f, pre_meeting_type: e.target.value }))} />
                          <span>Offline</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input type="radio" name="pre_meeting_type" value="ONLINE" checked={form.pre_meeting_type === 'ONLINE'} onChange={e => setForm((f: any) => ({ ...f, pre_meeting_type: e.target.value }))} />
                          <span>Online</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Preferred Consultation Time</label>
                      <input className="form-input" type="datetime-local" value={form.pre_meeting_time || ''} onChange={e => setForm((f: any) => ({ ...f, pre_meeting_time: e.target.value }))} required />
                    </div>
                  </div>
                )}
              </div>

              {service.questions.map((q: any, i: number) => (
                <div className="form-group" key={q.id}>
                  <label className="form-label">{q.question_text}</label>
                  <input className="form-input" required={q.is_required}
                    value={responses[i]?.response_text}
                    onChange={e => {
                      const newR = [...responses];
                      newR[i] = { ...newR[i], response_text: e.target.value };
                      setResponses(newR);
                    }}
                  />
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">Notes (Optional)</label>
                <textarea className="form-textarea" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} />
              </div>

              <div style={{ marginTop: 32, padding: 20, background: 'var(--surface2)', borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Advance Payment</span>
                  <span style={{ fontWeight: 700 }}>₹{parseFloat(service.advance_payment).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                  You will be redirected to payment after clicking confirm.
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                  disabled={submitting || !selectedSlot}>
                  {submitting ? 'Processing...' : `Confirm Booking ₹${parseFloat(service.advance_payment)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
