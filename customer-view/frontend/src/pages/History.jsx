import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const HISTORY = [
  { id: 'APT-G7H8I9', service: 'Hair Cut & Styling',  provider: 'Salon by Neha',   date: '2026-04-28', time: '3:00 PM',  duration: 60, price: 413, rating: 5 },
  { id: 'APT-J1K2L3', service: 'Yoga Session',         provider: 'Fit Life Studio', date: '2026-04-20', time: '7:00 AM',  duration: 60, price: 708, rating: 4 },
  { id: 'APT-R1S2T3', service: 'General Consultation', provider: 'Dr. Priya Sharma',date: '2026-03-15', time: '10:30 AM', duration: 30, price: 590, rating: 5 },
  { id: 'APT-U4V5W6', service: 'Skin Care Facial',     provider: 'Glow Clinic',     date: '2026-03-05', time: '2:00 PM',  duration: 75, price: 1121,rating: 4 },
  { id: 'APT-X7Y8Z9', service: 'Eye Test',             provider: 'Dr. Ravi Kapoor', date: '2026-02-20', time: '9:00 AM',  duration: 30, price: 472, rating: 5 },
];

export default function History() {
  const navigate = useNavigate();
  const totalSpent = HISTORY.reduce((sum, h) => sum + h.price, 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="History" subtitle="Home / History" />
        <div className="page-content">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Booking History</h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>Your past completed appointments</p>
            </div>
          </div>

          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Total Bookings',  value: HISTORY.length,      icon: '📋', color: '#4f46e5', bg: '#eef2ff' },
              { label: 'Total Spent',     value: `₹${totalSpent}`,    icon: '💰', color: '#059669', bg: '#d1fae5' },
              { label: 'Avg. Rating',     value: '4.6 ⭐',             icon: '⭐', color: '#d97706', bg: '#fef3c7' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* History list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {HISTORY.map((apt) => (
              <div key={apt.id} className="card" style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 4 }}>{apt.service}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      👤 {apt.provider} &nbsp;·&nbsp; 📅 {apt.date} &nbsp;·&nbsp; ⏰ {apt.time}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      {'⭐'.repeat(apt.rating)}{'☆'.repeat(5 - apt.rating)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>₹{apt.price}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{apt.id}</div>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => navigate('/book', { state: { service: { name: apt.service } } })}
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
