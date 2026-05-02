import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

import { SERVICES } from '../services/data';

const CATS = ['All', ...new Set(SERVICES.map(s => s.category))];

export default function Services() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter((s) => {
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
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>All Services</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>Browse our full catalogue of professional services</p>
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
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{s.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 600 }}>{s.category}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>👤 {s.provider}</div>
                  <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
                    <span>⏱ {s.duration} min</span>
                    <span>⭐ {s.rating} ({s.reviews} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--primary)' }}>₹{s.price}</span>
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
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 0' }}>No services found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
