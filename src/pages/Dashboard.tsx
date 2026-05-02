import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CalendarDays, IndianRupee, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', confirmed: '#10b981', rejected: '#ef4444', cancelled: '#94a3b8', rescheduled: '#0ea5e9'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboardStats()
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

  const peakData = stats?.peakHours?.map((h: any) => ({
    hour: `${h.hour}:00`,
    bookings: parseInt(h.bookings),
  })) || [];

  const statusData = stats?.bookingsByStatus?.map((s: any) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: parseInt(s.count),
    color: STATUS_COLORS[s.status] || '#6366f1',
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Here's what's happening with your appointments today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value" style={{ color: '#6366f1' }}>{stats?.totalBookings || 0}</div>
          <div className="stat-sub">All time</div>
          <CalendarDays size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#10b981' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          <div className="stat-sub">From paid bookings</div>
          <IndianRupee size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Upcoming</div>
          <div className="stat-value" style={{ color: '#0ea5e9' }}>{stats?.upcomingBookings?.length || 0}</div>
          <div className="stat-sub">Pending + Confirmed</div>
          <TrendingUp size={48} className="stat-icon" />
        </div>
        <div className="stat-card">
          <div className="stat-label">Peak Hour</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {peakData[0] ? peakData[0].hour : '--'}
          </div>
          <div className="stat-sub">Most bookings</div>
          <Clock size={48} className="stat-icon" />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Booking Trend (30 days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" fill="url(#colorB)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No booking data yet
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Bookings by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={10}
                  formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v}</span>} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No status data yet
            </div>
          )}
        </div>
      </div>

      {/* Peak Hours & Upcoming */}
      <div className="grid-2">
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Peak Booking Hours</h3>
          {peakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakData} barSize={32}>
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No peak hour data yet
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Upcoming Appointments</h3>
          {stats?.upcomingBookings?.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', padding: 32 }}>
              No upcoming appointments
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 240, overflowY: 'auto' }}>
            {stats?.upcomingBookings?.map((b: any) => (
              <div key={b.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px',
                background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)'
              }}>
                {b.status === 'confirmed' ? <CheckCircle size={20} color="#10b981" /> :
                  b.status === 'rejected' ? <XCircle size={20} color="#ef4444" /> :
                    <AlertCircle size={20} color="#f59e0b" />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{b.customer_name || 'Customer'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.service_title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>{format(new Date(b.slot_date), 'MMM d')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.start_time?.slice(0, 5)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
