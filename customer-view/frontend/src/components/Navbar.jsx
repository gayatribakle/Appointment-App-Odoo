import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';

export default function Navbar({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { appointments } = useAppointments();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Notifications show all appointments now (booked, cancelled, completed)
  const notifAppointments = appointments || [];
  const notifCount = notifAppointments.length;

  const SERVICES_LIST = ['General Consultation', 'Cardiology', 'Dental Care', 'Orthopedics', 'Dermatology', 'Neurology', 'Pediatrics'];
  const searchResults = SERVICES_LIST.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

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
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
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
        <div className="search-box" ref={searchRef} style={{ position: 'relative' }}>
          <span>🔍</span>
          <input 
            placeholder="Search services..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
          />
          {showSearch && searchQuery && (
            <div style={{
              position: 'absolute', top: 45, left: 0, width: '100%', background: 'var(--white)',
              border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000, overflow: 'hidden'
            }}>
              {searchResults.length > 0 ? searchResults.map(s => (
                <div 
                  key={s} 
                  style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, color: 'var(--text)' }}
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    navigate('/book');
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-bg)'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  {s}
                </div>
              )) : (
                <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>No services found</div>
              )}
            </div>
          )}
        </div>
        
        <div 
          className="icon-btn" 
          title="Notifications" 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setShowNotifications(!showNotifications)}
          ref={notifRef}
        >
          🔔
          {notifCount > 0 && (
            <span style={{
              position: 'absolute', top: -2, right: -2, background: '#ef4444', 
              color: 'white', fontSize: 10, width: 16, height: 16, 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {notifCount}
            </span>
          )}

          {showNotifications && (
            <div style={{
              position: 'absolute', top: 50, right: -60, background: 'var(--white)',
              border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              width: 300, zIndex: 1000, overflow: 'hidden', textAlign: 'left', cursor: 'default'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
                Notifications ({notifCount})
              </div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {notifCount === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No new notifications
                  </div>
                ) : (
                  notifAppointments.slice().reverse().map(apt => {
                    const isCancelled = apt.status === 'cancelled';
                    return (
                      <div 
                        key={apt.id} 
                        style={{ 
                          padding: '12px 16px', borderBottom: '1px solid var(--border)',
                          display: 'flex', gap: 12, alignItems: 'flex-start',
                          cursor: 'pointer', background: 'var(--white)'
                        }}
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/my-appointments', { state: { openAppointmentId: apt.id } });
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-bg)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--white)'}
                      >
                        <div style={{ fontSize: 20 }}>{isCancelled ? '❌' : '📅'}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isCancelled ? '#dc2626' : 'var(--text)', marginBottom: 2 }}>
                            {apt.status === 'confirmed' ? 'Booked: ' : apt.status === 'completed' ? 'Completed: ' : 'Cancelled: '} {apt.service}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            With {apt.provider} on {apt.date} at {apt.time}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {notifCount > 0 && (
                <div 
                  style={{ padding: '10px', textAlign: 'center', background: 'var(--bg)', color: 'var(--primary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  onClick={() => navigate('/my-appointments')}
                >
                  View all appointments
                </div>
              )}
            </div>
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
