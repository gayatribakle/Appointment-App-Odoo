import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Clock, Users, DollarSign, CheckCircle, XCircle, Save, Bell, Shield, Loader2 } from "lucide-react";

import { useData } from "../../context/DataContext";

export function BookingRules() {
  const { timeSlots, addTimeSlot, toggleTimeSlot, deleteTimeSlot, systemSettings, updateSettings, loading } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: "", startTime: "", endTime: "", maxBookings: 10, duration: 30 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [localSettings, setLocalSettings] = useState({
    maxBookingsPerDay: 50,
    bookingWindowDays: 30,
    cancellationWindowHours: 24,
    autoConfirmBookings: true,
    requireApproval: false,
    emailNotifications: true,
    smsNotifications: false
  });

  useEffect(() => {
    if (systemSettings) {
      setLocalSettings({
        maxBookingsPerDay: systemSettings.maxBookingsPerDay,
        bookingWindowDays: systemSettings.bookingWindowDays,
        cancellationWindowHours: systemSettings.cancellationWindowHours,
        autoConfirmBookings: systemSettings.autoConfirmBookings,
        requireApproval: systemSettings.requireApproval,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications
      });
    }
  }, [systemSettings]);

  const handleAddSlot = async () => {
    if (!newSlot.name || !newSlot.startTime || !newSlot.endTime) return;
    setIsSubmitting(true);
    try {
      await addTimeSlot(newSlot);
      setShowAddModal(false);
      setNewSlot({ name: "", startTime: "", endTime: "", maxBookings: 10, duration: 30 });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm("Delete this time slot?")) {
      try {
        await deleteTimeSlot(id);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      await updateSettings(localSettings);
      alert("Settings saved successfully!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Booking Rules</h2>
          <p className="text-gray-500">Configure booking policies and time slot management.</p>
        </div>
      </div>

      {/* Global Booking Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          Global Booking Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Auto-confirm Bookings</p>
                  <p className="text-xs text-gray-500">Confirm appointments automatically</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoConfirmBookings}
                  onChange={(e) => handleSettingChange("autoConfirmBookings", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Max Bookings Per Day</p>
                <p className="text-xs text-gray-500">System-wide daily limit</p>
              </div>
            </div>
            <input
              type="number"
              value={localSettings.maxBookingsPerDay}
              onChange={(e) => handleSettingChange("maxBookingsPerDay", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Booking Window (Days)</p>
                <p className="text-xs text-gray-500">How far in advance customers can book</p>
              </div>
            </div>
            <input
              type="number"
              value={localSettings.bookingWindowDays}
              onChange={(e) => handleSettingChange("bookingWindowDays", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Cancellation Window (Hours)</p>
                <p className="text-xs text-gray-500">Deadline for customer cancellations</p>
              </div>
            </div>
            <input
              type="number"
              value={localSettings.cancellationWindowHours}
              onChange={(e) => handleSettingChange("cancellationWindowHours", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Email Notifications</p>
                  <p className="text-xs text-gray-500">Send alerts to customers and staff</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.emailNotifications}
                  onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Global Settings
          </button>
        </div>
      </div>

      {/* Time Slots Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            Time Slot Configuration
          </h3>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
            Create New Slot
          </button>
        </div>

        <div className="space-y-4">
          {timeSlots.map((slot) => (
            <div key={slot.id} className="p-5 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    slot.active ? "bg-green-100" : "bg-gray-200"
                  }`}>
                    <Clock className={`w-6 h-6 ${slot.active ? "text-green-600" : "text-gray-500"}`} />
                  </div>
                  <div>
                    <h4 className="text-base text-gray-900 font-medium">{slot.name}</h4>
                    <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    slot.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                  }`}>
                    {slot.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleTimeSlot(slot.id, slot.active)}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Toggle
                  </button>
                  <button 
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Max Bookings:</span>
                  <span className="text-gray-900 font-medium">{slot.maxBookings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Duration:</span>
                  <span className="text-gray-900 font-medium">{slot.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Status:</span>
                  <span className="text-gray-900 font-medium">{slot.active ? "Open" : "Closed"}</span>
                </div>
              </div>
            </div>
          ))}
          {timeSlots.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No time slots configured.
            </div>
          )}
        </div>
      </div>

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Create New Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Name</label>
                <input type="text" value={newSlot.name} onChange={e => setNewSlot({...newSlot, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Late Night Session" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({...newSlot, endTime: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Bookings</label>
                  <input type="number" value={newSlot.maxBookings} onChange={e => setNewSlot({...newSlot, maxBookings: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={newSlot.duration} onChange={e => setNewSlot({...newSlot, duration: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="5" step="5" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button 
                onClick={handleAddSlot} 
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? "Creating..." : "Add Slot"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

