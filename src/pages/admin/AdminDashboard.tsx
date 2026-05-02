import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, Briefcase, IndianRupee, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminStats()
      .then((data: any) => setStats(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const trendData = stats?.bookingTrend?.map((t: any) => ({
    date: format(new Date(t.date), 'MMM d'),
    bookings: parseInt(t.count),
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Overview</h1>
        <p className="page-subtitle">System-wide monitoring and performance.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value" style={{ color: '#6366f1' }}>{stats?.totalUsers || 0}</div>
          <div className="stat-sub">Customers</div>
          <Users size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Organizers</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>{stats?.totalOrganizers || 0}</div>
          <div className="stat-sub">Providers</div>
          <Briefcase size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#10b981' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">Platform wide</div>
          <IndianRupee size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats?.pendingServices || 0}</div>
          <div className="stat-sub">Services</div>
          <AlertCircle size={48} className="stat-icon" />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Booking Trend (System-wide)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="bookings" stroke="#6366f1" fillOpacity={1} fill="url(#colorAdmin)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Recent Bookings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats?.recentBookings?.map((b: any) => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.customer_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.service_title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{format(new Date(b.slot_date), 'MMM d')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
