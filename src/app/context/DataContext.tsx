import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { api } from "../services/api";

// Types
export type User = { id: string; name: string; email: string; role: string; status: string; createdAt: string; };
export type Provider = { id: string; name: string; email: string; specialty: string; status: string; appointments: number; createdAt: string; };
export type Appointment = { id: string; customer: string; provider: string; service: string; date: string; time: string; duration: string; status: string; };

export type DashboardStats = {
  totalUsers: number;
  totalProviders: number;
  totalAppointments: number;
  confirmedAppts: number;
  recentAppts: Appointment[];
};

// Static data for charts (remains static for now unless backend provides it)
export const bookingsData = [
  { month: "Jan", bookings: 145, revenue: 14500 },
  { month: "Feb", bookings: 162, revenue: 16200 },
  { month: "Mar", bookings: 178, revenue: 17800 },
  { month: "Apr", bookings: 155, revenue: 15500 },
  { month: "May", bookings: 198, revenue: 19800 },
  { month: "Jun", bookings: 210, revenue: 21000 },
];

export const peakHoursData = [
  { hour: "8AM", bookings: 25 },
  { hour: "9AM", bookings: 42 },
  { hour: "10AM", bookings: 58 },
  { hour: "11AM", bookings: 48 },
  { hour: "12PM", bookings: 65 },
  { hour: "1PM", bookings: 52 },
  { hour: "2PM", bookings: 72 },
  { hour: "3PM", bookings: 68 },
  { hour: "4PM", bookings: 55 },
  { hour: "5PM", bookings: 38 },
  { hour: "6PM", bookings: 28 },
];

export const serviceDistribution = [
  { name: "General Checkup", value: 35 },
  { name: "Consultations", value: 28 },
  { name: "Follow-ups", value: 20 },
  { name: "Specialist Visits", value: 12 },
  { name: "Others", value: 5 },
];

export const weekdayTrends = [
  { day: "Mon", appointments: 42, cancellations: 3 },
  { day: "Tue", appointments: 48, cancellations: 5 },
  { day: "Wed", appointments: 52, cancellations: 2 },
  { day: "Thu", appointments: 45, cancellations: 4 },
  { day: "Fri", appointments: 38, cancellations: 6 },
  { day: "Sat", appointments: 28, cancellations: 2 },
  { day: "Sun", appointments: 15, cancellations: 1 },
];

// Context Definition
type DataContextType = {
  users: User[];
  providers: Provider[];
  appointments: Appointment[];
  timeSlots: any[];
  systemSettings: any;
  stats: DashboardStats;
  loading: boolean;
  refreshAll: () => Promise<void>;
  toggleUserStatus: (id: string, currentStatus: string) => Promise<void>;
  toggleProviderStatus: (id: string, currentStatus: string) => Promise<void>;
  addAppointment: (apt: Partial<Appointment>) => Promise<void>;
  addProvider: (provider: Partial<Provider>) => Promise<void>;
  addUser: (user: any) => Promise<void>;
  deleteProvider: (id: string) => Promise<void>;
  addTimeSlot: (slot: any) => Promise<void>;
  toggleTimeSlot: (id: string, currentStatus: boolean) => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
  updateSettings: (settings: any) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  bookingsData: typeof bookingsData;
  peakHoursData: typeof peakHoursData;
  serviceDistribution: typeof serviceDistribution;
  weekdayTrends: typeof weekdayTrends;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProviders: 0,
    totalAppointments: 0,
    confirmedAppts: 0,
    recentAppts: []
  });
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    try {
      const [usersData, providersData, apptsData, statsData, slotsData, settingsData] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/providers'),
        api.get('/admin/appointments'),
        api.get('/admin/dashboard'),
        api.get('/admin/time-slots'),
        api.get('/admin/settings')
      ]);
      setUsers(usersData);
      setProviders(providersData);
      setAppointments(apptsData);
      setStats(statsData);
      setTimeSlots(slotsData);
      setSystemSettings(settingsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only refresh if token exists (logged in)
    if (localStorage.getItem('token')) {
      refreshAll();
    }
  }, [refreshAll]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleUserStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    await api.patch(`/admin/users/${id}/status`, { status: newStatus });
    await refreshAll();
  };

  const toggleProviderStatus = async (id: string, currentStatus: string) => {
    const statuses = ["AVAILABLE", "BUSY", "OFF_DUTY"];
    const currentIndex = statuses.indexOf(currentStatus);
    const newStatus = statuses[(currentIndex + 1) % statuses.length];
    await api.patch(`/admin/providers/${id}/status`, { status: newStatus });
    await refreshAll();
  };

  const addAppointment = async (apt: Partial<Appointment>) => {
    await api.post('/admin/appointments', apt);
    await refreshAll();
  };

  const addProvider = async (provider: Partial<Provider>) => {
    await api.post('/admin/providers', provider);
    await refreshAll();
  };

  const addUser = async (user: any) => {
    await api.post('/admin/users', user);
    await refreshAll();
  };

  const deleteProvider = async (id: string) => {
    await api.delete(`/admin/providers/${id}`);
    await refreshAll();
  };

  const addTimeSlot = async (slot: any) => {
    await api.post('/admin/time-slots', slot);
    await refreshAll();
  };

  const toggleTimeSlot = async (id: string, currentStatus: boolean) => {
    await api.patch(`/admin/time-slots/${id}/status`, { active: !currentStatus });
    await refreshAll();
  };

  const deleteTimeSlot = async (id: string) => {
    await api.delete(`/admin/time-slots/${id}`);
    await refreshAll();
  };

  const updateSettings = async (settings: any) => {
    await api.post('/admin/settings', settings);
    await refreshAll();
  };

  return (
    <DataContext.Provider value={{
      users, providers, appointments, timeSlots, systemSettings, stats, loading,
      refreshAll, toggleUserStatus, toggleProviderStatus, addAppointment, addProvider, addUser, deleteProvider,
      addTimeSlot, toggleTimeSlot, deleteTimeSlot, updateSettings, theme, toggleTheme,
      bookingsData, peakHoursData, serviceDistribution, weekdayTrends
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

