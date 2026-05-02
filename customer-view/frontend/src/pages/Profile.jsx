import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Profile() {
  const [form, setForm] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+91 9876543210',
    dob: '1995-06-15',
    gender: 'Female',
    address: '123 Main Street, Mumbai, Maharashtra 400001',
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar title="Profile" subtitle="Home / Profile" />
        <div className="page-content">

          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {saved && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ Profile updated successfully!</div>}

            {/* Avatar section */}
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, padding: '24px 28px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 700, fontSize: 32, flexShrink: 0,
              }}>JD</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 20, color: '#111827' }}>{form.name}</div>
                <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>{form.email}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>Customer · Member since May 2025</div>
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
            </div>

            {/* Profile form */}
            <div className="card">
              <div className="card-title">Personal Information</div>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input name="name" className="form-input" value={form.name} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input name="phone" className="form-input" value={form.phone} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input name="dob" type="date" className="form-input" value={form.dob} onChange={handleChange} disabled={!editing} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select name="gender" className="form-input" value={form.gender} onChange={handleChange} disabled={!editing}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input name="address" className="form-input" value={form.address} onChange={handleChange} disabled={!editing} />
                </div>
                {editing && (
                  <div style={{ marginTop: 8 }}>
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '10px 28px' }}>
                      Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
