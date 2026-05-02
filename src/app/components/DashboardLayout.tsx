import { useState, useRef, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { LayoutDashboard, Users, UserCog, Calendar, Sliders, BarChart3, Settings, Search, Bell, User, LogOut, CheckCheck, Info, AlertTriangle, XCircle, Sun, Moon } from "lucide-react";
import { useData } from "../context/DataContext";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/users", icon: Users, label: "Users Management" },
  { path: "/providers", icon: UserCog, label: "Providers Management" },
  { path: "/appointments", icon: Calendar, label: "Appointments" },
  { path: "/booking-rules", icon: Sliders, label: "Booking Rules" },
  { path: "/reports", icon: BarChart3, label: "Reports & Analytics" },
  { path: "/settings", icon: Settings, label: "System Settings" },
];

const initialNotifications = [
  { id: "1", type: "info", title: "New booking created", desc: "John Doe booked an appointment with Dr. Amanda Chen.", time: "2 min ago", read: false },
  { id: "2", type: "success", title: "Booking confirmed", desc: "Jane Smith's appointment has been auto-confirmed.", time: "15 min ago", read: false },
  { id: "3", type: "warning", title: "Provider off-duty", desc: "Dr. Sophie Martinez has gone off-duty.", time: "1 hr ago", read: false },
  { id: "4", type: "error", title: "Booking cancelled", desc: "Chris Martinez cancelled his appointment.", time: "3 hr ago", read: true },
  { id: "5", type: "success", title: "New provider approved", desc: "Dr. David Kumar's profile is now active.", time: "Yesterday", read: true },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const { theme, toggleTheme } = useData();
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifIcon = (type: string) => {
    if (type === "success") return <CheckCheck className="w-4 h-4 text-green-500" />;
    if (type === "warning") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    if (type === "error") return <XCircle className="w-4 h-4 text-red-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl text-indigo-600 dark:text-indigo-400 font-semibold">BookingAdmin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(prev => !prev)}
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">{unreadCount} new</span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markRead(notif.id)}
                        className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? "bg-indigo-50/40" : ""}`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          {notifIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                          <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 text-center">
                    <button className="text-xs text-indigo-600 hover:underline">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser.name || "Admin User"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email || "admin@example.com"}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

