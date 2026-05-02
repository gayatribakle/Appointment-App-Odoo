import { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then((d: any) => setStats(d)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const trendData = stats?.bookingTrend?.map((t: any) => ({
    date: new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    bookings: parseInt(t.count),
  })) || [];

  const revenueData = stats?.revenueByService?.map((r: any) => ({
    name: r.title.length > 12 ? r.title.slice(0, 12) + '…' : r.title,
    revenue: parseFloat(r.revenue),
    bookings: parseInt(r.bookings),
  })) || [];

  const peakData = stats?.peakHours?.map((h: any) => ({
    hour: `${String(h.hour).padStart(2, '0')}:00`,
    bookings: parseInt(h.bookings),
  })) || [];

  const statusData = stats?.bookingsByStatus?.map((s: any) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: parseInt(s.count),
  })) || [];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9'];

  const tooltipStyle = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <p className="page-subtitle">Insights into your booking performance</p>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value" style={{ color: '#6366f1' }}>{stats?.totalBookings || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: '#10b981' }}>₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confirmed</div>
          <div className="stat-value" style={{ color: '#10b981' }}>
            {statusData.find((s: any) => s.name === 'Confirmed')?.value || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cancelled / Rejected</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            {(statusData.find((s: any) => s.name === 'Cancelled')?.value || 0) +
             (statusData.find((s: any) => s.name === 'Rejected')?.value || 0)}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Booking Trend */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Booking Trend (30 days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="bookings" stroke="#6366f1" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>

        {/* Revenue by Service */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Revenue by Service (₹)</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `₹${v.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>
      </div>

      <div className="grid-2">
        {/* Peak Hours */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Peak Booking Hours</h3>
          {peakData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={peakData} barSize={32}>
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="bookings" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>

        {/* Status Breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: '1rem', fontWeight: 600 }}>Status Breakdown</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={75} dataKey="value" paddingAngle={3}>
                  {statusData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{v}</span>} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>
      </div>

      {/* Revenue Table */}
      {revenueData.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: '1rem', fontWeight: 600 }}>Revenue by Service — Detail</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Service</th><th>Bookings</th><th>Revenue (₹)</th><th>Avg/Booking (₹)</th></tr>
              </thead>
              <tbody>
                {stats?.revenueByService?.map((r: any) => (
                  <tr key={r.title}>
                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                    <td>{r.bookings}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>₹{parseFloat(r.revenue).toLocaleString('en-IN')}</td>
                    <td>{r.bookings > 0 ? `₹${(parseFloat(r.revenue) / parseInt(r.bookings)).toFixed(0)}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
