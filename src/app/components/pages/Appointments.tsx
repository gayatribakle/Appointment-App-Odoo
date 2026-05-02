import { useState } from "react";
import { Search, Filter, Eye, Calendar as CalendarIcon, ChevronDown, List, Grid, ChevronLeft, ChevronRight } from "lucide-react";

import { useData } from "../../context/DataContext";
const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function Appointments() {
  const { appointments } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProvider, setFilterProvider] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || appointment.status === filterStatus;
    const matchesProvider = filterProvider === "All" || appointment.provider === filterProvider;
    const matchesDate = !filterDate || appointment.date === filterDate;
    return matchesSearch && matchesStatus && matchesProvider && matchesDate;
  });

  const statusCounts = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "Confirmed").length,
    pending: appointments.filter(a => a.status === "Pending").length,
    completed: appointments.filter(a => a.status === "Completed").length,
    cancelled: appointments.filter(a => a.status === "Cancelled").length,
  };

  // Calendar logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getAppointmentsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Appointments</h2>
          <p className="text-gray-500">View and manage all appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                viewMode === "calendar" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="w-4 h-4" />
              Calendar
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <CalendarIcon className="w-5 h-5" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl text-gray-900">{statusCounts.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Confirmed</p>
          <p className="text-2xl text-green-600">{statusCounts.confirmed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl text-yellow-600">{statusCounts.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl text-blue-600">{statusCounts.completed}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Cancelled</p>
          <p className="text-2xl text-red-600">{statusCounts.cancelled}</p>
        </div>
      </div>

      {/* Filters and Search */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search customer or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                <option>All Status</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All Providers</option>
              <option>Dr. Amanda Chen</option>
              <option>Dr. Marcus Roberts</option>
              <option>Dr. Jessica Park</option>
              <option>Dr. David Kumar</option>
              <option>Dr. Sophie Martinez</option>
              <option>Dr. James Wilson</option>
            </select>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Customer</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Provider</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Service</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Date & Time</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Duration</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Status</th>
                    <th className="text-left text-xs text-gray-500 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {appointment.customer.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-sm text-gray-900">{appointment.customer}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{appointment.provider}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{appointment.service}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{appointment.date}</p>
                          <p className="text-gray-500">{appointment.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{appointment.duration}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-700"
                              : appointment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : appointment.status === "Completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="flex items-center gap-2 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Showing {filteredAppointments.length} of {appointments.length} appointments</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {daysInWeek.map(day => (
              <div key={day} className="text-center text-sm text-gray-500 font-medium py-2">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {getDaysInMonth(currentDate).map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="min-h-24 bg-gray-50 rounded-lg" />;
              }

              const dayAppointments = getAppointmentsForDate(day);

              return (
                <div key={day} className="min-h-24 border border-gray-200 rounded-lg p-2 hover:border-indigo-300 transition-colors">
                  <div className="text-sm text-gray-900 font-medium mb-2">{day}</div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 2).map(apt => (
                      <div
                        key={apt.id}
                        className={`text-xs p-1 rounded ${
                          apt.status === "Confirmed"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : apt.status === "Completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {apt.time}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
