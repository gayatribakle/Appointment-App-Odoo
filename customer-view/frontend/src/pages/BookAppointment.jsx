import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Stepper from '../components/Stepper';

import { SERVICES, PROVIDERS } from '../services/data';

export default function BookAppointment() {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelected = location.state?.service;

  const [selectedService, setSelectedService] = useState(preSelected || null);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const providers = selectedService ? (PROVIDERS[selectedService.id] || []) : [];

  const handleNext = () => {
    if (!selectedService || !selectedProvider) return;
    navigate('/book/date', { state: { service: selectedService, provider: selectedProvider } });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">

        {/* Custom header matching screenshot */}
        <div style={{
          background: 'var(--white)',
          borderBottom: '1px solid #e5e7eb',
          padding: '20px 28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Book Your Appointment</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Home / Book Appointment</div>
            </div>
          </div>
          <Stepper currentStep={1} />
        </div>

        <div style={{ padding: '28px' }}>

          {/* Select Service */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Select a Service</div>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 10, 
              maxHeight: '280px', 
              overflowY: 'auto',
              paddingRight: '4px'
            }}>
              {SERVICES.map((s) => {
                const isSelected = selectedService?.id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedService(s); setSelectedProvider(null); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-bg)' : '#fafafa',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: isSelected ? 'var(--primary-light)' : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    }}>
                      {s.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {s.category} · {s.duration} min
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>₹{s.price}</div>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      background: isSelected ? 'var(--primary)' : 'var(--white)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isSelected && <span style={{ color: 'var(--white)', fontSize: 11 }}>✓</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Select Provider */}
          {selectedService && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-title">Select Provider</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {providers.map((p) => {
                  const isSelected = selectedProvider?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => p.available && setSelectedProvider(p)}
                      style={{
                        border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 12,
                        padding: '18px 14px',
                        textAlign: 'center',
                        cursor: p.available ? 'pointer' : 'not-allowed',
                        background: isSelected ? 'var(--primary-bg)' : p.available ? 'var(--white)' : 'var(--bg)',
                        opacity: p.available ? 1 : 0.55,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: isSelected ? 'var(--primary)' : '#6366f1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--white)', fontWeight: 700, fontSize: 18,
                        margin: '0 auto 10px',
                      }}>
                        {p.initials}
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{p.specialty}</div>
                      <div style={{ marginTop: 8 }}>
                        {p.available
                          ? <span className="badge badge-green">Available</span>
                          : <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Unavailable</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom actions */}
          <div className="step-actions">
            <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back</button>
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 32px' }}
              disabled={!selectedService || !selectedProvider}
              onClick={handleNext}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
