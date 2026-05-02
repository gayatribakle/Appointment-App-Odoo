import { useState, useEffect } from "react";
import { Save, Shield, Bell, Calendar, Users, Edit2, Plus, Trash2, Loader2, Info } from "lucide-react";

import { useData } from "../../context/DataContext";

export function Settings() {
  const { systemSettings, updateSettings, loading, users } = useData();
  const [activeTab, setActiveTab] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    maxBookingsPerDay: 50,
    bookingWindowDays: 30,
    cancellationWindowHours: 24,
    autoConfirmBookings: true,
    emailNotifications: true,
    smsNotifications: false,
    requireApproval: false,
  });

  useEffect(() => {
    if (systemSettings) {
      setLocalSettings({
        maxBookingsPerDay: systemSettings.maxBookingsPerDay,
        bookingWindowDays: systemSettings.bookingWindowDays,
        cancellationWindowHours: systemSettings.cancellationWindowHours,
        autoConfirmBookings: systemSettings.autoConfirmBookings,
        emailNotifications: systemSettings.emailNotifications,
        smsNotifications: systemSettings.smsNotifications,
        requireApproval: systemSettings.requireApproval,
      });
    }
  }, [systemSettings]);

  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const roleCounts = {
    ADMIN: users.filter(u => u.role === "ADMIN").length,
    CUSTOMER: users.filter(u => u.role === "CUSTOMER").length,
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Settings</h2>
          <p className="text-gray-500">Configure system preferences and permissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium text-sm ${
                activeTab === "general"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <Calendar className="w-4 h-4" />
              General
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium text-sm ${
                activeTab === "roles"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <Shield className="w-4 h-4" />
              Role Management
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors font-medium text-sm ${
                activeTab === "notifications"
                  ? "border-indigo-600 text-indigo-600 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Booking Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Maximum Bookings Per Day</p>
                      <p className="text-xs text-gray-500">Limit total appointments per day</p>
                    </div>
                    <input
                      type="number"
                      value={localSettings.maxBookingsPerDay}
                      onChange={(e) => handleSettingChange("maxBookingsPerDay", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Booking Window (Days)</p>
                      <p className="text-xs text-gray-500">How far in advance users can book</p>
                    </div>
                    <input
                      type="number"
                      value={localSettings.bookingWindowDays}
                      onChange={(e) => handleSettingChange("bookingWindowDays", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Cancellation Window (Hours)</p>
                      <p className="text-xs text-gray-500">Minimum notice required for cancellation</p>
                    </div>
                    <input
                      type="number"
                      value={localSettings.cancellationWindowHours}
                      onChange={(e) => handleSettingChange("cancellationWindowHours", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Auto-confirm Bookings</p>
                      <p className="text-xs text-gray-500">Automatically confirm new bookings if time slot is available</p>
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
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save General Settings
                </button>
              </div>
            </div>
          )}

          {/* Role Management Tab */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">System Roles</h3>
                <div className="flex items-center gap-2 text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Info className="w-4 h-4" />
                  Roles are system-defined and cannot be added or deleted.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">ADMIN</h4>
                      <p className="text-xs text-gray-500">Full system access and control</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-bold text-indigo-600">{roleCounts.ADMIN}</span>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900">CUSTOMER</h4>
                      <p className="text-xs text-gray-500">Book and view appointments</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-bold text-indigo-600">{roleCounts.CUSTOMER}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-8 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive booking updates via email</p>
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

                  <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive booking updates via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.smsNotifications}
                        onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Notification Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
