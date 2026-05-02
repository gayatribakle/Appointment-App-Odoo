import { useState } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="btn btn-icon btn-secondary" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative' }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: 'var(--primary)',
            color: 'white',
            fontSize: '0.65rem',
            padding: '2px 5px',
            borderRadius: 10,
            border: '2px solid var(--surface1)',
            minWidth: 18,
            fontWeight: 700
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', inset: 0, zIndex: 998 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div className="card" style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            width: 350,
            maxHeight: 500,
            zIndex: 999,
            padding: 0,
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--surface2)'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Notifications</h3>
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={markAllAsRead}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Mark all as read
                </button>
                <X size={16} onClick={() => setIsOpen(false)} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 && (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={48} style={{ opacity: 0.1, marginBottom: 12 }} />
                  <p style={{ fontSize: '0.88rem' }}>No notifications yet</p>
                </div>
              )}
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: n.is_read ? 'var(--text)' : 'var(--primary)' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {format(new Date(n.created_at), 'HH:mm')}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
