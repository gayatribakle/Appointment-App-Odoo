import React, { createContext, useContext, useState, ReactNode } from "react";

// Types
export type User = { id: string; name: string; email: string; role: string; status: string; joined: string; };
export type Provider = { id: string; name: string; email: string; specialty: string; rating: number; appointments: number; status: string; joined: string; };
export type Appointment = { id: string; customer: string; provider: string; service: string; date: string; time: string; duration: string; status: string; };

export type DashboardStats = {
  totalUsers: number;
  totalProviders: number;
  totalAppointments: number;
  revenue: number;
};

// Initial Data
const initialUsers: User[] = [
  { id: "1", name: "John Doe", email: "john.doe@email.com", role: "Customer", status: "Active", joined: "2025-01-15" },
  { id: "2", name: "Jane Smith", email: "jane.smith@email.com", role: "Customer", status: "Active", joined: "2025-02-20" },
  { id: "3", name: "Mike Johnson", email: "mike.j@email.com", role: "Admin", status: "Active", joined: "2024-11-10" },
  { id: "4", name: "Sarah Williams", email: "sarah.w@email.com", role: "Customer", status: "Inactive", joined: "2025-03-05" },
  { id: "5", name: "Tom Brown", email: "tom.brown@email.com", role: "Manager", status: "Active", joined: "2024-12-18" },
  { id: "6", name: "Emily Davis", email: "emily.d@email.com", role: "Customer", status: "Active", joined: "2025-04-12" },
  { id: "7", name: "Robert Wilson", email: "robert.w@email.com", role: "Customer", status: "Inactive", joined: "2025-01-28" },
  { id: "8", name: "Lisa Anderson", email: "lisa.a@email.com", role: "Manager", status: "Active", joined: "2025-02-14" },
];

const initialProviders: Provider[] = [
  { id: "1", name: "Dr. Amanda Chen", email: "a.chen@clinic.com", specialty: "General Medicine", rating: 4.8, appointments: 142, status: "Available", joined: "2024-08-15" },
  { id: "2", name: "Dr. Marcus Roberts", email: "m.roberts@clinic.com", specialty: "Cardiology", rating: 4.9, appointments: 198, status: "Available", joined: "2024-06-10" },
  { id: "3", name: "Dr. Jessica Park", email: "j.park@clinic.com", specialty: "Pediatrics", rating: 4.7, appointments: 167, status: "Busy", joined: "2024-09-22" },
  { id: "4", name: "Dr. David Kumar", email: "d.kumar@clinic.com", specialty: "Dermatology", rating: 4.6, appointments: 89, status: "Available", joined: "2025-01-08" },
  { id: "5", name: "Dr. Sophie Martinez", email: "s.martinez@clinic.com", specialty: "Orthopedics", rating: 4.9, appointments: 213, status: "Off-duty", joined: "2024-05-12" },
  { id: "6", name: "Dr. James Wilson", email: "j.wilson@clinic.com", specialty: "Neurology", rating: 4.8, appointments: 176, status: "Available", joined: "2024-10-03" },
];

const initialAppointments: Appointment[] = [
  { id: "1", customer: "John Doe", provider: "Dr. Amanda Chen", service: "General Checkup", date: "2026-05-02", time: "10:00 AM", duration: "30 min", status: "Confirmed" },
  { id: "2", customer: "Jane Smith", provider: "Dr. Marcus Roberts", service: "Cardiology Consultation", date: "2026-05-02", time: "11:30 AM", duration: "45 min", status: "Confirmed" },
  { id: "3", customer: "Mike Johnson", provider: "Dr. Jessica Park", service: "Pediatric Visit", date: "2026-05-02", time: "2:00 PM", duration: "30 min", status: "Pending" },
  { id: "4", customer: "Sarah Williams", provider: "Dr. David Kumar", service: "Skin Consultation", date: "2026-05-03", time: "9:00 AM", duration: "30 min", status: "Confirmed" },
  { id: "5", customer: "Tom Brown", provider: "Dr. Sophie Martinez", service: "Orthopedic Follow-up", date: "2026-05-03", time: "3:30 PM", duration: "30 min", status: "Completed" },
  { id: "6", customer: "Emily Davis", provider: "Dr. James Wilson", service: "Neurology Checkup", date: "2026-05-04", time: "10:30 AM", duration: "45 min", status: "Confirmed" },
  { id: "7", customer: "Robert Wilson", provider: "Dr. Amanda Chen", service: "Annual Physical", date: "2026-05-04", time: "1:00 PM", duration: "60 min", status: "Pending" },
  { id: "8", customer: "Lisa Anderson", provider: "Dr. Marcus Roberts", service: "Heart Screening", date: "2026-05-05", time: "11:00 AM", duration: "45 min", status: "Confirmed" },
  { id: "9", customer: "Chris Martinez", provider: "Dr. Jessica Park", service: "Child Vaccination", date: "2026-05-05", time: "2:30 PM", duration: "20 min", status: "Cancelled" },
  { id: "10", customer: "Anna Thompson", provider: "Dr. David Kumar", service: "Dermatology Treatment", date: "2026-05-06", time: "9:30 AM", duration: "30 min", status: "Confirmed" },
];

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
  stats: DashboardStats;
  toggleUserStatus: (id: string) => void;
  toggleProviderStatus: (id: string) => void;
  addAppointment: (apt: Appointment) => void;
  bookingsData: typeof bookingsData;
  peakHoursData: typeof peakHoursData;
  serviceDistribution: typeof serviceDistribution;
  weekdayTrends: typeof weekdayTrends;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
  };

  const toggleProviderStatus = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        let newStatus = "Available";
        if (p.status === "Available") newStatus = "Busy";
        else if (p.status === "Busy") newStatus = "Off-duty";
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const addAppointment = (apt: Appointment) => {
    setAppointments(prev => [...prev, apt]);
  };

  const stats: DashboardStats = {
    totalUsers: users.length,
    totalProviders: providers.length,
    totalAppointments: appointments.length,
    revenue: 105000, // Static for now, or calculate based on appointments if there's logic for it
  };

  return (
    <DataContext.Provider value={{
      users, providers, appointments, stats,
      toggleUserStatus, toggleProviderStatus, addAppointment,
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
