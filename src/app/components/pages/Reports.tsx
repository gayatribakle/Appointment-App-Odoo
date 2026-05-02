import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, Calendar, DollarSign, Download } from "lucide-react";

import { useData } from "../../context/DataContext";

const COLORS = ["#4F46E5", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6"];

export function Reports() {
  const { stats, bookingsData, peakHoursData, serviceDistribution, weekdayTrends, providers } = useData();

  // Compute provider utilization from providers state
  const providerUtilization = providers.map(provider => {
    // Mock utilization calculation based on appointments
    // Normally this would come from backend
    const utilization = Math.min(100, Math.max(0, 50 + (provider.appointments * 0.2)));
    return { name: provider.name, utilization: Math.round(utilization) };
  });

  const totalRevenue = stats.revenue >= 1000 ? `${(stats.revenue / 1000).toFixed(0)}K` : stats.revenue.toString();

  // Custom tooltip formatter to add currency symbol to revenue
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-sm rounded-lg">
          <p className="text-gray-700 font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name === 'revenue' ? `₹${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Reports & Insights</h2>
          <p className="text-gray-500">Analytics and performance metrics.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded">+15%</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Bookings</p>
          <p className="text-3xl">{stats.totalAppointments.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded">+23%</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Revenue</p>
          <p className="text-3xl">₹{totalRevenue}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded">+8%</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Active Customers</p>
          <p className="text-3xl">{stats.totalUsers.toLocaleString()}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-sm bg-white/20 px-2 py-1 rounded">87%</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Utilization</p>
          <p className="text-3xl">82.5%</p>
        </div>
      </div>

      {/* Bookings and Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4">Bookings & Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={bookingsData}>
            <defs>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="bookings" stroke="#4F46E5" fillOpacity={1} fill="url(#colorBookings)" />
            <Area type="monotone" dataKey="revenue" stroke="#22C55E" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Peak Hours and Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="bookings" fill="#4F46E5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Service Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {serviceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider Utilization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4">Provider Utilization Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={providerUtilization} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" stroke="#6b7280" domain={[0, 100]} />
            <YAxis dataKey="name" type="category" stroke="#6b7280" width={150} />
            <Tooltip />
            <Bar dataKey="utilization" fill="#22C55E" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekday Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4">Weekday Appointment Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weekdayTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="appointments" stroke="#4F46E5" strokeWidth={2} />
            <Line type="monotone" dataKey="cancellations" stroke="#EF4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
