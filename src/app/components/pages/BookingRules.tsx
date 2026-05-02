import { useState } from "react";
import { Plus, Edit2, Trash2, Clock, Users, DollarSign, CheckCircle, XCircle, Save } from "lucide-react";

const slotsData = [
  { id: "1", name: "Morning Session", startTime: "08:00", endTime: "12:00", maxBookings: 10, duration: 30, active: true },
  { id: "2", name: "Afternoon Session", startTime: "13:00", endTime: "17:00", maxBookings: 15, duration: 30, active: true },
  { id: "3", name: "Evening Session", startTime: "17:00", endTime: "20:00", maxBookings: 8, duration: 45, active: false },
];

export function BookingRules() {
  const [slots, setSlots] = useState(slotsData);
  const [settings, setSettings] = useState({
    advancePayment: false,
    manualConfirmation: true,
    autoAssignment: "auto",
    maxBookingsPerSlot: 10,
    bufferTime: 15,
    allowCancellation: true,
    cancellationDeadline: 24,
  });

  const toggleSlotStatus = (slotId: string) => {
    setSlots(slots.map(slot =>
      slot.id === slotId ? { ...slot, active: !slot.active } : slot
    ));
  };

  const handleSettingChange = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Booking Rules</h2>
          <p className="text-gray-500">Configure booking policies and time slot management.</p>
        </div>
      </div>

      {/* Global Booking Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
          Global Booking Policies
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Advance Payment Toggle */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Advance Payment Required</p>
                  <p className="text-xs text-gray-500">Require payment before confirmation</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.advancePayment}
                  onChange={(e) => handleSettingChange("advancePayment", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-13">
              {settings.advancePayment ? "Payment is required to confirm bookings" : "Bookings can be made without payment"}
            </p>
          </div>

          {/* Manual Confirmation Toggle */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Manual Confirmation</p>
                  <p className="text-xs text-gray-500">Admin must approve bookings</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.manualConfirmation}
                  onChange={(e) => handleSettingChange("manualConfirmation", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-xs text-gray-600 ml-13">
              {settings.manualConfirmation ? "Bookings require admin approval" : "Bookings are auto-confirmed"}
            </p>
          </div>

          {/* Resource Assignment */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Resource Assignment</p>
                <p className="text-xs text-gray-500">How providers are assigned</p>
              </div>
            </div>
            <select
              value={settings.autoAssignment}
              onChange={(e) => handleSettingChange("autoAssignment", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="auto">Auto Assignment</option>
              <option value="manual">Manual Assignment</option>
              <option value="customer">Customer Choice</option>
            </select>
          </div>

          {/* Buffer Time */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Buffer Time (minutes)</p>
                <p className="text-xs text-gray-500">Gap between appointments</p>
              </div>
            </div>
            <input
              type="number"
              value={settings.bufferTime}
              onChange={(e) => handleSettingChange("bufferTime", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="0"
              step="5"
            />
          </div>

          {/* Max Bookings Per Slot */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-900 font-medium">Max Bookings Per Slot</p>
                <p className="text-xs text-gray-500">Maximum simultaneous bookings</p>
              </div>
            </div>
            <input
              type="number"
              value={settings.maxBookingsPerSlot}
              onChange={(e) => handleSettingChange("maxBookingsPerSlot", parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min="1"
            />
          </div>

          {/* Cancellation Policy */}
          <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-900 font-medium">Allow Cancellation</p>
                  <p className="text-xs text-gray-500">Customers can cancel bookings</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowCancellation}
                  onChange={(e) => handleSettingChange("allowCancellation", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            {settings.allowCancellation && (
              <div className="mt-3">
                <label className="text-xs text-gray-600 mb-2 block">Cancellation deadline (hours before)</label>
                <input
                  type="number"
                  value={settings.cancellationDeadline}
                  onChange={(e) => handleSettingChange("cancellationDeadline", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Save className="w-5 h-5" />
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
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
            Create New Slot
          </button>
        </div>

        <div className="space-y-4">
          {slots.map((slot) => (
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
                    onClick={() => toggleSlotStatus(slot.id)}
                    className="px-3 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    Toggle
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors">
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
        </div>
      </div>

      {/* Booking Constraints Summary */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h3 className="text-lg text-gray-900 mb-4">Active Booking Constraints</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Payment Policy</p>
            <p className="text-sm text-gray-900 font-medium">
              {settings.advancePayment ? "Advance Payment Required" : "Payment Optional"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Confirmation Mode</p>
            <p className="text-sm text-gray-900 font-medium">
              {settings.manualConfirmation ? "Manual Approval" : "Auto-Confirm"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Provider Assignment</p>
            <p className="text-sm text-gray-900 font-medium capitalize">{settings.autoAssignment}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
