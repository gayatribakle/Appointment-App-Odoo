import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import ServiceCard from '../components/ServiceCard';

const SERVICES = [
  { id: 1, name: 'General Consultation', provider: 'Dr. Priya Sharma',   duration: 30, price: 500,  category: 'General',      emoji: '🩺', rating: 4.8 },
  { id: 2, name: 'Dental Checkup',        provider: 'Dr. Arjun Mehta',   duration: 45, price: 800,  category: 'Dental',       emoji: '🦷', rating: 4.7 },
  { id: 3, name: 'Cardiology Assessment', provider: 'Dr. Neha Singh',    duration: 60, price: 1500, category: 'Cardiology',   emoji: '❤️', rating: 4.9 },
  { id: 4, name: 'Orthopedic Visit',      provider: 'Dr. Vikas Patel',   duration: 45, price: 1200, category: 'Orthopedics',  emoji: '🦴', rating: 4.6 },
  { id: 5, name: 'Vision Test',           provider: 'Dr. Ravi Kapoor',   duration: 30, price: 400,  category: 'Ophthalmology',emoji: '👁️', rating: 4.8 },
  { id: 6, name: 'Pediatric Visit',       provider: 'Dr. Sunita Rao',    duration: 45, price: 600,  category: 'Pediatrics',   emoji: '👶', rating: 5.0 },
];

const UPCOMING = [
  { id: 'u1', service: 'General Consultation', provider: 'Dr. Priya Sharma', date: '2026-05-10', time: '10:00 AM', status: 'Confirmed' },
  { id: 'u2', service: 'Cardiology Assessment',provider: 'Dr. Neha Singh',   date: '2026-05-14', time: '7:00 AM',  status: 'Confirmed' },
];

const CATEGORIES = ['All Services', 'General', 'Dental', 'Cardiology', 'Orthopedics', 'Ophthalmology', 'Pediatrics'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Services');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter((s) => {
    const matchCat = activeTab === 'All Services' || s.category === activeTab;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Discover Services" subtitle="Home / Services" />
        <div className="page-content">

          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Discover Services</h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>
                Find and book from our network of professional providers
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 22px' }}
              onClick={() => navigate('/book')}
            >
              ➕ Book Appointment
            </button>
          </div>

          {/* Category tabs + search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip${activeTab === cat ? ' active' : ''}`}
                  onClick={() => setActiveTab(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="search-box" style={{ minWidth: 220 }}>
              <span>🔍</span>
              <input
                placeholder="Search services or providers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Services grid */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>
              No services found.
            </div>
          ) : (
            <div className="services-grid" style={{ marginTop: 0 }}>
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          {/* Upcoming Appointments */}
          <div style={{ marginTop: 36 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 14 }}>
              Upcoming Appointments
            </h2>
            {UPCOMING.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', color: '#9ca3af', padding: '32px' }}>
                No upcoming appointments.{' '}
                <span className="link" onClick={() => navigate('/book')}>Book one now →</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {UPCOMING.map((apt) => (
                  <div key={apt.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: '#eef2ff', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
                    }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#111827' }}>{apt.service}</div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
                        👤 {apt.provider} · {apt.date} · {apt.time}
                      </div>
                    </div>
                    <span className="badge badge-green">{apt.status}</span>
                    <button className="btn btn-outline btn-sm">View Details</button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
