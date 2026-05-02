import { Outlet, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import UserSidebar from './UserSidebar';
import NotificationCenter from './NotificationCenter';

export default function UserLayout() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-center" style={{ minHeight: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user || user.role !== 'user') return <Navigate to="/login" replace />;
  return (
    <div className="layout">
      <UserSidebar />
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
