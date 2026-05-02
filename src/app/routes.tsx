import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { Dashboard } from "./components/pages/Dashboard";
import { UsersManagement } from "./components/pages/UsersManagement";
import { ProvidersManagement } from "./components/pages/ProvidersManagement";
import { Appointments } from "./components/pages/Appointments";
import { BookingRules } from "./components/pages/BookingRules";
import { Reports } from "./components/pages/Reports";
import { Settings } from "./components/pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: UsersManagement },
      { path: "providers", Component: ProvidersManagement },
      { path: "appointments", Component: Appointments },
      { path: "booking-rules", Component: BookingRules },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
