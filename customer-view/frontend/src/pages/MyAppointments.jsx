import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const APPOINTMENTS = [
  { id: 'APT-A1B2C3', service: 'General Consultation', provider: 'Dr. Priya Sharma', date: '2026-05-10', time: '10:00 AM', duration: 30, price: 590, status: 'confirmed' },
  { id: 'APT-D4E5F6', service: 'Dental Checkup',        provider: 'Dr. Arjun Mehta',  date: '2026-05-14', time: '11:30 AM', duration: 45, price: 944, status: 'confirmed' },
  { id: 'APT-G7H8I9', service: 'Hair Cut & Styling',    provider: 'Salon by Neha',    date: '2026-04-28', time: '3:00 PM',  duration: 60, price: 413, status: 'completed' },
  { id: 'APT-J1K2L3', service: 'Yoga Session',          provider: 'Fit Life Studio',  date: '2026-04-20', time: '7:00 AM',  duration: 60, price: 708, status: 'completed' },
  { id: 'APT-M4N5O6', service: 'Eye Test',              provider: 'Dr. Ravi Kapoor',  date: '2026-04-10', time: '9:30 AM',  duration: 30, price: 472, status: 'cancelled' },
];

const STATUS_COLORS = {
  confirmed: { bg: '#d1fae5', color: '#065f46', label: 'Confirmed' },
  completed: { bg: '#e0e7ff', color: '#3730a3', label: 'Completed' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const TABS = ['All', 'Upcoming', 'Completed', 'Cancelled'];

export default function MyAppointments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = APPOINTMENTS.filter((a) => {
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
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>My Appointments</h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>Track and manage all your bookings</p>
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 22px' }}
              onClick={() => navigate('/book')}>
              ➕ Book New
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Upcoming',  value: APPOINTMENTS.filter(a => a.status === 'confirmed').length,  icon: '📅', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Completed', value: APPOINTMENTS.filter(a => a.status === 'completed').length,  icon: '✅', color: '#059669', bg: '#d1fae5' },
              { label: 'Cancelled', value: APPOINTMENTS.filter(a => a.status === 'cancelled').length,   icon: '❌', color: '#dc2626', bg: '#fee2e2' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
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
              <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '48px' }}>
                No appointments found.
              </div>
            ) : filtered.map((apt) => {
              const s = STATUS_COLORS[apt.status];
              return (
                <div key={apt.id} className="card" style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>📋</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{apt.service}</span>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 999, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        👤 {apt.provider} &nbsp;·&nbsp; 📅 {apt.date} &nbsp;·&nbsp; ⏰ {apt.time} &nbsp;·&nbsp; ⏱ {apt.duration} min
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>Booking ID: {apt.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>₹{apt.price}</div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {apt.status === 'confirmed' && (
                          <button className="btn btn-outline btn-sm" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>Cancel</button>
                        )}
                        <button className="btn btn-outline btn-sm">Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
