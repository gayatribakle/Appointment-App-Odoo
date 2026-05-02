import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { appointments } = useAppointments();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const upcomingCount = appointments?.filter(a => a.status === 'confirmed').length || 0;

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'JD';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-title">{title || 'Dashboard'}</div>
        {subtitle && <div className="navbar-breadcrumb">{subtitle}</div>}
      </div>
      <div className="navbar-right">
        <div className="search-box">
          <span>🔍</span>
          <input placeholder="Search services..." />
        </div>
        
        <div className="icon-btn" title="Notifications" style={{ position: 'relative' }}>
          🔔
          {upcomingCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, background: '#ef4444', 
              color: 'white', fontSize: 10, width: 16, height: 16, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {upcomingCount}
            </span>
          )}
        </div>
        <div className="icon-btn" title="Messages">💬</div>
        
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            className="user-avatar" 
            style={{ cursor: 'pointer', background: 'var(--primary)', color: 'white' }}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {initials}
          </div>
          
          {showDropdown && (
            <div style={{
              position: 'absolute', top: 50, right: 0, background: 'var(--white)',
              border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: 150, zIndex: 1000, overflow: 'hidden'
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{user?.name || 'Guest'}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'Not logged in'}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{ 
                  width: '100%', padding: '10px 14px', textAlign: 'left', background: 'none', 
                  border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 500
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#fee2e2'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
