import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const ALL_SERVICES = [
  { id: 1, name: 'General Consultation', provider: 'Dr. Priya Sharma',  duration: 30, price: 500,  category: 'Medical',  emoji: '🩺', rating: 4.8, reviews: 120 },
  { id: 2, name: 'Dental Checkup',        provider: 'Dr. Arjun Mehta',  duration: 45, price: 800,  category: 'Dental',   emoji: '🦷', rating: 4.7, reviews: 89  },
  { id: 3, name: 'Hair Cut & Styling',    provider: 'Salon by Neha',    duration: 60, price: 350,  category: 'Beauty',   emoji: '✂️', rating: 4.9, reviews: 210 },
  { id: 4, name: 'Deep Tissue Massage',   provider: 'Wellness Hub',     duration: 90, price: 1200, category: 'Wellness', emoji: '💆', rating: 4.6, reviews: 75  },
  { id: 5, name: 'Eye Test',              provider: 'Dr. Ravi Kapoor',  duration: 30, price: 400,  category: 'Medical',  emoji: '👁️', rating: 4.8, reviews: 95  },
  { id: 6, name: 'Yoga Session',          provider: 'Fit Life Studio',  duration: 60, price: 600,  category: 'Fitness',  emoji: '🧘', rating: 5.0, reviews: 180 },
  { id: 7, name: 'Skin Care Facial',      provider: 'Glow Clinic',      duration: 75, price: 950,  category: 'Beauty',   emoji: '🧖', rating: 4.7, reviews: 140 },
  { id: 8, name: 'Physiotherapy',         provider: 'Dr. Sunita Rao',   duration: 45, price: 700,  category: 'Medical',  emoji: '🏃', rating: 4.9, reviews: 60  },
];

const CATS = ['All', 'Medical', 'Dental', 'Beauty', 'Wellness', 'Fitness'];

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = ALL_SERVICES.filter((s) => {
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.provider.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Services" subtitle="Home / Services" />
        <div className="page-content">

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>All Services</h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginTop: 3 }}>Browse our full catalogue of professional services</p>
            </div>
            <div className="search-box" style={{ minWidth: 240 }}>
              <span>🔍</span>
              <input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
            {CATS.map((c) => (
              <button key={c} className={`filter-chip${activeCategory === c ? ' active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>

          {/* Services grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map((s) => (
              <div key={s.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ height: 100, background: 'linear-gradient(135deg, #eef2ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  {s.emoji}
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{s.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: '#eef2ff', color: '#4f46e5', fontWeight: 600 }}>{s.category}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>👤 {s.provider}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#6b7280', marginBottom: 14 }}>
                    <span>⏱ {s.duration} min</span>
                    <span>⭐ {s.rating} ({s.reviews} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>₹{s.price}</span>
                    <button className="btn btn-primary" style={{ width: 'auto', padding: '7px 18px', fontSize: 13 }}
                      onClick={() => navigate('/book', { state: { service: s } })}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 0' }}>No services found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
