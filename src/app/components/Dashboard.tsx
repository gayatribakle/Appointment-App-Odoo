import { TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

const quickActions = [
  { label: 'Create Service', color: 'bg-[#4F9CF9]' },
  { label: 'Add Provider', color: 'bg-[#22C55E]' },
  { label: 'Open Schedule', color: 'bg-[#F59E0B]' },
];

export function Dashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        return res.json();
      })
      .then(data => setDashboardData(data))
      .catch(e => {
        console.error(e);
        setError('Unable to load dashboard data. Please ensure the backend server is running.');
      });
  }, []);

  if (error) return <div className="text-[#EF4444] bg-[#EF4444]/10 p-4 rounded-lg border border-[#EF4444]/20">{error}</div>;
  if (!dashboardData) return <div className="text-[#94A3B8]">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {dashboardData.kpis.map((kpi: any, index: number) => (
          <div key={index} className="bg-[#121821] border border-[#2A3441] rounded-lg p-6">
            <p className="text-xs text-[#94A3B8] mb-2">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl text-[#E6EDF3]">{kpi.value}</h3>
              <div className={`flex items-center gap-1 text-xs ${kpi.isUp ? 'text-[#22C55E]' : 'text-[#94A3B8]'}`}>
                {kpi.isUp && <TrendingUp size={14} />}
                <span>{kpi.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Recent Bookings */}
      <div className="grid grid-cols-3 gap-6">
        {/* Peak Booking Hours Chart */}
        <div className="col-span-2 bg-[#121821] border border-[#2A3441] rounded-lg p-6">
          <h3 className="text-lg text-[#E6EDF3] mb-4">Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardData.peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" />
              <XAxis dataKey="hour" stroke="#94A3B8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94A3B8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1A2330', border: '1px solid #2A3441', borderRadius: '8px' }}
                labelStyle={{ color: '#E6EDF3' }}
              />
              <Bar dataKey="bookings" fill="#4F9CF9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Bookings */}
        <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-6">
          <h3 className="text-lg text-[#E6EDF3] mb-4">Recent Bookings</h3>
          <div className="space-y-3">
            {dashboardData.recentBookings.map((booking: any, index: number) => (
              <div key={index} className="pb-3 border-b border-[#2A3441] last:border-0">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm text-[#E6EDF3]">{booking.customer}</p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'confirmed' ? 'bg-[#22C55E]/20 text-[#22C55E]' :
                    booking.status === 'pending' ? 'bg-[#F59E0B]/20 text-[#F59E0B]' :
                    'bg-[#EF4444]/20 text-[#EF4444]'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8]">{booking.service} • {booking.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#121821] border border-[#2A3441] rounded-lg p-6">
        <h3 className="text-lg text-[#E6EDF3] mb-4">Quick Actions</h3>
        <div className="flex gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className={`${action.color} text-[#E6EDF3] px-6 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
