import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Settings() {
  const [notif, setNotif] = useState({ email: true, sms: true, reminder: true, promo: false });
  const [privacy, setPrivacy] = useState({ shareData: false, analytics: true });
  const [saved, setSaved] = useState('');

  const toggle = (group, key) => {
    if (group === 'notif') setNotif((p) => ({ ...p, [key]: !p[key] }));
    if (group === 'privacy') setPrivacy((p) => ({ ...p, [key]: !p[key] }));
  };

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 2500);
  };

  const Toggle = ({ checked, onChange }) => (
    <div
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 999, cursor: 'pointer', transition: 'background 0.2s',
        background: checked ? '#4f46e5' : '#d1d5db', position: 'relative', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );

  const SettingRow = ({ label, desc, checked, onChange }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: '#111827' }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Settings" subtitle="Home / Settings" />
        <div className="page-content">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>

            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Settings</h1>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Manage your account preferences</p>

            {saved && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ {saved} settings saved!</div>}

            {/* Notifications */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">🔔 Notification Preferences</div>
              <SettingRow label="Email Notifications" desc="Receive booking confirmations and updates via email"
                checked={notif.email} onChange={() => toggle('notif', 'email')} />
              <SettingRow label="SMS Notifications" desc="Get SMS reminders for upcoming appointments"
                checked={notif.sms} onChange={() => toggle('notif', 'sms')} />
              <SettingRow label="Appointment Reminders" desc="Remind me 24 hours before my appointment"
                checked={notif.reminder} onChange={() => toggle('notif', 'reminder')} />
              <SettingRow label="Promotional Offers" desc="Receive offers, discounts and new service announcements"
                checked={notif.promo} onChange={() => toggle('notif', 'promo')} />
              <button className="btn btn-primary" style={{ marginTop: 16, width: 'auto', padding: '9px 24px' }}
                onClick={() => handleSave('Notification')}>Save Notifications</button>
            </div>

            {/* Privacy */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">🔒 Privacy & Data</div>
              <SettingRow label="Share Data with Providers" desc="Allow providers to access your appointment history"
                checked={privacy.shareData} onChange={() => toggle('privacy', 'shareData')} />
              <SettingRow label="Analytics Tracking" desc="Help us improve the experience with anonymous usage data"
                checked={privacy.analytics} onChange={() => toggle('privacy', 'analytics')} />
              <button className="btn btn-primary" style={{ marginTop: 16, width: 'auto', padding: '9px 24px' }}
                onClick={() => handleSave('Privacy')}>Save Privacy Settings</button>
            </div>

            {/* Account */}
            <div className="card">
              <div className="card-title">⚙️ Account Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>🔑 Change Password</button>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>📥 Download My Data</button>
                <button className="btn btn-outline" style={{ justifyContent: 'flex-start', color: '#dc2626', borderColor: '#fca5a5' }}>🗑️ Delete Account</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
