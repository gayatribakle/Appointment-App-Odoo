import { Users, UserCog, Calendar, TrendingUp } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useData } from "../../context/DataContext";

const COLORS = ["#4F46E5", "#22C55E", "#EF4444"];

export function Dashboard() {
  const { stats, appointments, bookingsData, peakHoursData, providers } = useData();

  // Compute provider utilization from providers state
  const activeProviders = providers.filter(p => p.status === "Available").length;
  const busyProviders = providers.filter(p => p.status === "Busy").length;
  const offDutyProviders = providers.filter(p => p.status === "Off-duty").length;

  const providerUtilization = [
    { name: "Available", value: activeProviders },
    { name: "Busy", value: busyProviders },
    { name: "Off-duty", value: offDutyProviders },
  ].filter(item => item.value > 0);

  // Get 5 most recent appointments
  const recentBookings = [...appointments].reverse().slice(0, 5);

  const kpiCards = [
    { title: "Total Users", value: stats.totalUsers.toLocaleString(), change: "+12%", icon: Users, color: "bg-blue-500" },
    { title: "Total Providers", value: stats.totalProviders.toLocaleString(), change: "+5%", icon: UserCog, color: "bg-green-500" },
    { title: "Total Appointments", value: stats.totalAppointments.toLocaleString(), change: "+18%", icon: Calendar, color: "bg-indigo-600" },
    { title: "Revenue", value: `₹${stats.revenue.toLocaleString()}`, change: "+23%", icon: TrendingUp, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-gray-900 mb-1">Dashboard</h2>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">{card.change}</span>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
              <p className="text-2xl text-gray-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Bookings Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bookings" stroke="#4F46E5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Booking Hours */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Peak Booking Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#22C55E" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row: Pie Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Utilization */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Provider Utilization</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={providerUtilization}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {providerUtilization.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Recent Bookings</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs text-gray-500 pb-3 px-2">Customer</th>
                  <th className="text-left text-xs text-gray-500 pb-3 px-2">Service</th>
                  <th className="text-left text-xs text-gray-500 pb-3 px-2">Date & Time</th>
                  <th className="text-left text-xs text-gray-500 pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm text-gray-900">{booking.customer}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">{booking.service}</td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {booking.date} {booking.time}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500 text-sm">No recent bookings found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
