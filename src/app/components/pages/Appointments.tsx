import { useState } from "react";
import { Search, Filter, Eye, Calendar as CalendarIcon, ChevronDown, List, Grid, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { useData } from "../../context/DataContext";
const daysInWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

import { Appointment } from "../../context/DataContext";

export function Appointments() {
  const { appointments, addAppointment, providers, loading } = useData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterProvider, setFilterProvider] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // May 2026

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Appointment | null>(null);
  const [newAppointment, setNewAppointment] = useState({ customer: "", provider: "", service: "", date: "", time: "", duration: "30 min" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAppointment = async () => {
    if (!newAppointment.customer || !newAppointment.provider || !newAppointment.service || !newAppointment.date || !newAppointment.time) return;
    
    setIsSubmitting(true);
    try {
      await addAppointment(newAppointment);
      setShowAddModal(false);
      setNewAppointment({ customer: "", provider: "", service: "", date: "", time: "", duration: "30 min" });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch =
      appointment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || appointment.status === filterStatus.toUpperCase();
    const matchesProvider = filterProvider === "All" || appointment.provider === filterProvider;
    const matchesDate = !filterDate || appointment.date === filterDate;
    return matchesSearch && matchesStatus && matchesProvider && matchesDate;
  });

  const statusCounts = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === "CONFIRMED").length,
    pending: appointments.filter(a => a.status === "PENDING").length,
    completed: appointments.filter(a => a.status === "COMPLETED").length,
    cancelled: appointments.filter(a => a.status === "CANCELLED").length,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Appointments</h2>
          <p className="text-gray-500">View and manage all appointments.</p>
        </div>
        <div className="flex items-center gap-3">
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
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
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
                <option>All</option>
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
              {providers.map(p => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
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
                            appointment.status === "CONFIRMED"
                              ? "bg-green-100 text-green-700"
                              : appointment.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : appointment.status === "COMPLETED"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setShowDetailsModal(appointment)} className="flex items-center gap-2 px-3 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                        No appointments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Showing {filteredAppointments.length} of {appointments.length} appointments</p>
          </div>
        </>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

          <div className="grid grid-cols-7 gap-2">
            {daysInWeek.map(day => (
              <div key={day} className="text-center text-sm text-gray-500 font-medium py-2">
                {day}
              </div>
            ))}

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
                          apt.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : apt.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : apt.status === "COMPLETED"
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

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Appointment Details</h3>
            <div className="space-y-3 text-sm">
              <p><strong className="text-gray-700">Customer:</strong> <span className="text-gray-900">{showDetailsModal.customer}</span></p>
              <p><strong className="text-gray-700">Provider:</strong> <span className="text-gray-900">{showDetailsModal.provider}</span></p>
              <p><strong className="text-gray-700">Service:</strong> <span className="text-gray-900">{showDetailsModal.service}</span></p>
              <p><strong className="text-gray-700">Date:</strong> <span className="text-gray-900">{showDetailsModal.date}</span></p>
              <p><strong className="text-gray-700">Time:</strong> <span className="text-gray-900">{showDetailsModal.time}</span></p>
              <p><strong className="text-gray-700">Duration:</strong> <span className="text-gray-900">{showDetailsModal.duration}</span></p>
              <p><strong className="text-gray-700">Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs ${
                showDetailsModal.status === "CONFIRMED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>{showDetailsModal.status}</span></p>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setShowDetailsModal(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">New Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input type="text" value={newAppointment.customer} onChange={e => setNewAppointment({...newAppointment, customer: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Alice Johnson" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select value={newAppointment.provider} onChange={e => setNewAppointment({...newAppointment, provider: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                  <option value="">Select a provider...</option>
                  {providers.filter(p => p.status !== "OFF_DUTY").map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <input type="text" value={newAppointment.service} onChange={e => setNewAppointment({...newAppointment, service: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Heart Checkup" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={handleAddAppointment} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

