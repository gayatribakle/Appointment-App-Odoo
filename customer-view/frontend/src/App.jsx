import React, { useState, useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { AppointmentProvider } from './context/AppointmentContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      style={{
        position: 'fixed', bottom: 24, right: 24, width: 50, height: 50,
        borderRadius: '50%', background: 'var(--primary)', color: '#fff', border: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', cursor: 'pointer', fontSize: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        transition: 'transform 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Toggle Theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppointmentProvider>
        <AppRoutes />
        <ThemeToggle />
      </AppointmentProvider>
    </AuthProvider>
  );
}
