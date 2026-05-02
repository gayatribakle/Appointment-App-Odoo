import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import ResetPassword from '../pages/ResetPassword';
import Signup from '../pages/Signup';
import VerifyOTP from '../pages/VerifyOTP';
import Dashboard from '../pages/Dashboard';
import BookAppointment from '../pages/BookAppointment';
import SelectDate from '../pages/SelectDate';
import SelectTime from '../pages/SelectTime';
import IntakeForm from '../pages/IntakeForm';
import Payment from '../pages/Payment';
import Confirmation from '../pages/Confirmation';
import MyAppointments from '../pages/MyAppointments';
import Services from '../pages/Services';
import History from '../pages/History';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<MyAppointments />} />
        <Route path="/services" element={<Services />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/book" element={<BookAppointment />} />
        <Route path="/book/date" element={<SelectDate />} />
        <Route path="/book/time" element={<SelectTime />} />
        <Route path="/book/intake" element={<IntakeForm />} />
        <Route path="/book/payment" element={<Payment />} />
        <Route path="/book/confirmation" element={<Confirmation />} />
      </Routes>
    </BrowserRouter>
  );
}
