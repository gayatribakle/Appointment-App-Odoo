import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV = [
  { section: 'MAIN', items: [
    { label: 'Dashboard',        icon: '🏠', path: '/dashboard'    },
    { label: 'My Appointments',  icon: '📅', path: '/appointments' },
    { label: 'Book Service',     icon: '➕', path: '/book'          },
  ]},
  { section: 'ACCOUNT', items: [
    { label: 'Services',  icon: '🛠️', path: '/services' },
    { label: 'History',   icon: '🕒', path: '/history'  },
    { label: 'Profile',   icon: '👤', path: '/profile'  },
    { label: 'Settings',  icon: '⚙️', path: '/settings' },
  ]},
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div 
        className="sidebar-logo" 
        onClick={() => navigate('/dashboard')} 
        style={{ cursor: 'pointer' }}
      >
        <div className="logo-icon">📋</div>
        <span>AppointEase</span>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="nav-section-title">{group.section}</div>
            {group.items.map((item) => (
              <div
                key={item.path}
                className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">JD</div>
          <div>
            <div className="user-name">Jane Doe</div>
            <div className="user-role">Customer</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
