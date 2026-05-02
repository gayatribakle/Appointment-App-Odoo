import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import NotificationCenter from './NotificationCenter';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <AdminSidebar />
      <main className="main-content">
        <header className="main-header">
          <div style={{ flex: 1 }} />
          <NotificationCenter />
        </header>
        <div style={{ padding: 32 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
