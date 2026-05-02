import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { name, provider, duration, price, category, emoji } = service;

  return (
    <div className="service-card">
      <div className="service-card-img">
        <span style={{ fontSize: 44 }}>{emoji || '🛠️'}</span>
      </div>
      <div className="service-card-body">
        <div className="service-card-name">{name}</div>
        <div className="service-card-provider">👤 {provider}</div>
        <div className="service-meta">
          <div className="service-meta-item">⏱ {duration} min</div>
          <span className="badge badge-indigo">{category}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#4f46e5' }}>₹{price}</div>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '8px 18px' }}
            onClick={() => navigate('/book', { state: { service } })}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
