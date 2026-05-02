import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';

import Login from './pages/Login';
import Signup from './pages/Signup';

// Organizer Pages
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Bookings from './pages/Bookings';
import CalendarView from './pages/CalendarView';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';

// User Pages
import Home from './pages/user/Home';
import ServiceDetail from './pages/user/ServiceDetail';
import MyBookings from './pages/user/MyBookings';
import MeetingRoom from './pages/MeetingRoom';

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Organizer Protected Routes */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/services" element={<Services />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/meeting/:bookingId" element={<MeetingRoom />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/services" element={<AdminServices />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>

            {/* User (Customer) Protected Routes */}
            <Route element={<UserLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/meeting/:bookingId" element={<MeetingRoom />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
