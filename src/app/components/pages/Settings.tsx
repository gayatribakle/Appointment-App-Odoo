import { useState } from "react";
import { Save, Shield, Bell, Calendar, Users, Edit2, Plus, Trash2 } from "lucide-react";

const rolesData = [
  { id: "1", name: "Admin", description: "Full system access and control", users: 3, permissions: ["All"] },
  { id: "2", name: "Manager", description: "Manage providers and appointments", users: 5, permissions: ["View All", "Edit Appointments", "Manage Providers"] },
  { id: "3", name: "Customer", description: "Book and view own appointments", users: 1240, permissions: ["View Own", "Book Appointments"] },
];

export function Settings() {
  const [roles] = useState(rolesData);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    maxBookingsPerDay: 50,
    bookingWindowDays: 30,
    cancellationWindowHours: 24,
    autoConfirmBookings: true,
    emailNotifications: true,
    smsNotifications: false,
    requireApproval: false,
  });

  const handleSettingChange = (key: string, value: boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-gray-900 mb-1">Settings</h2>
          <p className="text-gray-500">Configure system preferences and permissions.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "general"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-5 h-5" />
              General
            </button>
            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "roles"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Shield className="w-5 h-5" />
              Role Management
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === "notifications"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Bell className="w-5 h-5" />
              Notifications
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-900 mb-4">Booking Rules</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Maximum Bookings Per Day</p>
                      <p className="text-xs text-gray-500">Limit total appointments per day</p>
                    </div>
                    <input
                      type="number"
                      value={settings.maxBookingsPerDay}
                      onChange={(e) => handleSettingChange("maxBookingsPerDay", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Booking Window (Days)</p>
                      <p className="text-xs text-gray-500">How far in advance users can book</p>
                    </div>
                    <input
                      type="number"
                      value={settings.bookingWindowDays}
                      onChange={(e) => handleSettingChange("bookingWindowDays", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Cancellation Window (Hours)</p>
                      <p className="text-xs text-gray-500">Minimum notice required for cancellation</p>
                    </div>
                    <input
                      type="number"
                      value={settings.cancellationWindowHours}
                      onChange={(e) => handleSettingChange("cancellationWindowHours", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Auto-confirm Bookings</p>
                      <p className="text-xs text-gray-500">Automatically confirm new bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoConfirmBookings}
                        onChange={(e) => handleSettingChange("autoConfirmBookings", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Require Admin Approval</p>
                      <p className="text-xs text-gray-500">Admin must approve all bookings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.requireApproval}
                        onChange={(e) => handleSettingChange("requireApproval", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          )}

          {/* Role Management Tab */}
          {activeTab === "roles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-gray-900">User Roles</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-5 h-5" />
                  Add Role
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-base text-gray-900">{role.name}</h4>
                          <p className="text-sm text-gray-500">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-white rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Users: </span>
                        <span className="text-gray-900">{role.users}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Permissions: </span>
                        <div className="flex gap-2">
                          {role.permissions.map((perm, idx) => (
                            <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">Email Notifications</p>
                      <p className="text-xs text-gray-500">Receive booking updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange("emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 mb-1">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Receive booking updates via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange("smsNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-3">
                      <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-900 mb-1">Notification Events</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• New booking created</li>
                          <li>• Booking confirmed</li>
                          <li>• Booking cancelled</li>
                          <li>• Upcoming appointment reminder (24h before)</li>
                          <li>• Provider status change</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Save className="w-5 h-5" />
                Save Preferences
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
