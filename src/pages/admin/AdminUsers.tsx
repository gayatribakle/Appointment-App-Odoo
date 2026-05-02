import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { UserCheck, UserX, Shield } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    api.getAdminAllUsers(filter).then((d: any) => setUsers(d)).finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const toggleStatus = async (id: number, current: boolean) => {
    setActionLoading(true);
    try {
      await api.updateUserStatus(id, !current);
      load();
    } finally { setActionLoading(false); }
  };

  const changeRole = async (id: number, current: string) => {
    const next = current === 'user' ? 'organizer' : 'user';
    if (!confirm(`Change role to ${next}?`)) return;
    setActionLoading(true);
    try {
      await api.updateUserRole(id, next);
      load();
    } finally { setActionLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">View and control system accounts.</p>
      </div>

      <div className="chip-group" style={{ marginBottom: 20 }}>
        {['', 'user', 'organizer', 'admin'].map(r => (
          <button key={r} className={`chip ${filter === r ? 'active' : ''}`} onClick={() => setFilter(r)}>
            {r === '' ? 'ALL' : r.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id}>
                    <td><div style={{ fontWeight: 600 }}>{u.name}</div></td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-secondary">{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-confirmed' : 'badge-rejected'}`}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => toggleStatus(u.id, u.is_active)} disabled={actionLoading || u.role === 'admin'}>
                          {u.is_active ? <><UserX size={14} /> Disable</> : <><UserCheck size={14} /> Enable</>}
                        </button>
                        {u.role !== 'admin' && (
                          <button className="btn btn-sm btn-secondary" onClick={() => changeRole(u.id, u.role)}>
                            <Shield size={14} /> Switch Role
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
