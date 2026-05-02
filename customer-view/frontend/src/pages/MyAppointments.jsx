import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal';
import { useAppointments } from '../context/AppointmentContext';

const STATUS_COLORS = {
  confirmed: { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' },
  completed: { bg: 'var(--primary-bg)', color: '#3730a3', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export default function MyAppointments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedApt, setSelectedApt] = useState(null);
  const { appointments, cancelAppointment } = useAppointments();

  useEffect(() => {
    if (location.state?.openAppointmentId) {
      const apt = appointments.find(a => a.id === location.state.openAppointmentId);
      if (apt) {
        setSelectedApt(apt);
        // Clear state so it doesn't reopen on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, appointments, navigate]);

  const handleCancel = (id) => {
    if (window.confirm('Are you confirm cancelling the appointment?')) {
      cancelAppointment(id);
    }
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return a.status === 'confirmed';
    if (activeTab === 'Completed') return a.status === 'completed';
    if (activeTab === 'Cancelled') return a.status === 'cancelled';
    return true;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Appointments" subtitle="Home / My Appointments" />
        <div className="page-content">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>My Appointments</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>Track and manage all your bookings</p>
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 22px' }}
              onClick={() => navigate('/book')}>
              ➕ Book New
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Upcoming',  value: appointments.filter(a => a.status === 'confirmed').length,  icon: '📅', color: 'var(--primary)', bg: 'var(--primary-bg)' },
              { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length,  icon: '✅', color: '#059669', bg: '#d1fae5' },
              { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length,   icon: '❌', color: '#dc2626', bg: '#fee2e2' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {TABS.map((t) => (
              <button key={t} className={`filter-chip${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {/* Appointment list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '48px' }}>
                No appointments found.
              </div>
            ) : filtered.map((apt) => {
              const s = STATUS_COLORS[apt.status];
              return (
                <div key={apt.id} className="card" style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📋</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{apt.service}</span>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                        👤 {apt.provider} &nbsp;·&nbsp; 📅 {apt.date} &nbsp;·&nbsp; ⏰ {apt.time} &nbsp;·&nbsp; ⏱ {apt.duration} min
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>Booking ID: {apt.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{apt.price}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {apt.status === 'confirmed' && (
                          <button 
                            onClick={() => handleCancel(apt.id)}
                            className="btn btn-outline btn-sm" 
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                          >
                            Cancel
                          </button>
                        )}
                        <button onClick={() => setSelectedApt(apt)} className="btn btn-outline btn-sm">Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AppointmentDetailsModal 
        appointment={selectedApt} 
        onClose={() => setSelectedApt(null)} 
      />
    </div>
  );
}
