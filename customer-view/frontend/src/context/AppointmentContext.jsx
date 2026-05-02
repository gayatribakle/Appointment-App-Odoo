import React, { createContext, useState, useContext, useEffect } from 'react';

const AppointmentContext = createContext();

const INITIAL_APPOINTMENTS = [
  { id: 'APT-A1B2C3', service: 'General Consultation', provider: 'Dr. Priya Sharma', date: '2026-05-10', time: '10:00 AM', duration: 30, price: 500, status: 'confirmed' },
  { id: 'APT-D4E5F6', service: 'Dental Checkup',        provider: 'Dr. Arjun Mehta',  date: '2026-05-14', time: '11:30 AM', duration: 45, price: 800, status: 'confirmed' },
  { id: 'APT-G7H8I9', service: 'Cardiology Assessment', provider: 'Dr. Neha Singh',   date: '2026-04-28', time: '3:00 PM',  duration: 60, price: 1500, status: 'completed' },
  { id: 'APT-J1K2L3', service: 'Orthopedic Visit',      provider: 'Dr. Vikas Patel',  date: '2026-04-20', time: '7:00 AM',  duration: 45, price: 1200, status: 'completed' },
  { id: 'APT-M4N5O6', service: 'Vision Test',           provider: 'Dr. Ravi Kapoor',  date: '2026-04-10', time: '9:30 AM',  duration: 30, price: 400, status: 'cancelled' },
];

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('my_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('my_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = (apt) => {
    setAppointments(prev => [apt, ...prev]);
  };

  const cancelAppointment = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  return (
    <AppointmentContext.Provider value={{ appointments, addAppointment, cancelAppointment }}>
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentContext);
