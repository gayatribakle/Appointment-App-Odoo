import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { api } from '../../services/api';
import { format, addDays, startOfDay } from 'date-fns';
import { ArrowLeft, CheckCircle2, Link2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PaymentModal from '../../components/PaymentModal';

export default function SharedServiceDetail() {
  const { token } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    api.getServiceByToken(token)
      .then((d: any) => {
        setService(d);
        setResponses(d.questions?.map((q: any) => ({ question_id: q.id, response_text: '' })) || []);
      })
      .catch((err: any) => setError(err.message || 'Invalid or expired link.'))
      .finally(() => setLoading(false));
  }, [token]);

  const filteredSlots = (service?.available_slots || []).filter((s: any) => {
    const sDate = new Date(s.slot_date).toLocaleDateString('en-CA');
    const matchesDate = sDate === selectedDate;
    const matchesProvider = !selectedProvider || s.provider_id === selectedProvider.id;
    return matchesDate && matchesProvider;
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return alert('Please select a time slot');
    if (!user) return alert('Please log in to book this appointment.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.customer_email)) return alert('Please enter a valid email address.');
    const phoneRegex = /^[0-9+()-\s]{10,}$/;
    if (!phoneRegex.test(form.customer_phone)) return alert('Please enter a valid phone number (min 10 digits).');

    setSubmitting(true);
    try {
      const res: any = await api.userCreateBooking({
        service_id: service.id,
        slot_id: selectedSlot.id,
        ...form,
        responses
      });
      if (res.status === 'pending' && Number(service.advance_payment) > 0) {
        setPendingBooking(res);
        setShowPaymentModal(true);
      } else {
        setBooked(res);
      }
    } catch (err: any) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  
  if (error) return (
    <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: 40 }}>
        <Link2 size={48} style={{ opacity: 0.3, marginBottom: 16, color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 8 }}>Invalid Link</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    </div>
  );

  if (!service) return <div className="alert alert-error">Service not found</div>;

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
            {Number(service.advance_payment) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>₹{Number(service.advance_payment).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
          {user ? (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/my-bookings')}>View My Bookings</button>
          ) : (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>Login to Manage</button>
          )}
        </div>
      </div>
    );
  }

  if (showPaymentModal && pendingBooking) {
    return (
      <PaymentModal 
        isOpen={true} 
        onClose={() => setShowPaymentModal(false)}
        bookingId={pendingBooking.id}
        amount={Number(service.advance_payment)}
        onSuccess={() => {
          setShowPaymentModal(false);
          setBooked({ ...pendingBooking, status: 'confirmed' });
        }}
        onFailure={(err) => {
          alert('Payment Failed: ' + err);
          setShowPaymentModal(false);
        }}
      />
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      {/* Shared link badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '10px 16px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: 10, width: 'fit-content' }}>
        <Link2 size={16} color="#6366f1" />
        <span style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>You are viewing a privately shared appointment link</span>
      </div>

      {!user && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          You must <a href="/login" style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'underline' }}>log in</a> to book this appointment.
        </div>
      )}

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
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {service.available_slots?.length === 0 
                        ? '📅 No slots have been opened for this service yet.'
                        : `❌ No slots available for ${format(new Date(selectedDate), 'EEEE, MMM d')}.`
                      }
                    </p>
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

              {service.questions?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>Additional Questions</label>
                  {service.questions.map((q: any, i: number) => (
                    <div key={q.id} className="form-group">
                      <label className="form-label">{q.question_text} {q.is_required && '*'}</label>
                      <input className="form-input" required={q.is_required}
                        value={responses[i]?.response_text || ''}
                        onChange={e => {
                          const updated = [...responses];
                          updated[i] = { question_id: q.id, response_text: e.target.value };
                          setResponses(updated);
                        }} />
                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 20 }} disabled={submitting || !user}>
                {!user ? 'Login Required to Book' : submitting ? 'Booking...' : `Confirm Booking${Number(service.advance_payment) > 0 ? ` • ₹${Number(service.advance_payment).toLocaleString('en-IN')}` : ''}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
