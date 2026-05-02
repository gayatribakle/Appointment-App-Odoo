import React from 'react';

export default function Navbar({ title, subtitle }) {
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
        <div className="icon-btn" title="Notifications">🔔</div>
        <div className="icon-btn" title="Messages">💬</div>
        <div className="user-avatar" style={{ cursor: 'pointer' }}>JD</div>
      </div>
    </header>
  );
}
