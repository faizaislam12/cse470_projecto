import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const ROLE_LABELS = { household: 'Household', collector: 'Collector', recycling_company: 'Recycling Co.', business: 'Business', admin: 'Admin' };
const ROLE_OPTIONS = ['household', 'collector', 'recycling_company', 'business', 'admin'];

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => { fetchUsers(); }, [roleFilter, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (q) params.q = q;
      const { data } = await api.get('/admin/users', { params });
      setUsers(data.data);
    } catch {}
    setLoading(false);
  };

  const openChangeRole = (u) => { setSelected(u); setNewRole(u.role); setShowModal(true); };

  const saveRole = async () => {
    try {
      await api.patch(`/admin/users/${selected._id}/role`, { role: newRole });
      setMsg(`Role updated to ${ROLE_LABELS[newRole]} for ${selected.name}.`);
      setShowModal(false);
      fetchUsers();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to update role.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="eco-dark">
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">User Management</span></h1><p className="subtitle">View platform users and manage their roles.</p></div>
      </div>
      {msg && <div className="success">{msg}</div>}

      <div className="filter-bar">
        <input className="eco-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or email…" />
        <select className="eco-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : (
        <DataTable glass
          columns={[
            { key: 'name', label: 'Name', render: (u) => <strong>{u.name}</strong> },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role', render: (u) => (
              <span style={{ background: 'rgba(16,185,129,0.12)', color: '#34d399', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{ROLE_LABELS[u.role] || u.role}</span>
            ) },
            { key: 'ecoPoints', label: 'EcoPoints' },
            { key: 'createdAt', label: 'Joined', render: (u) => new Date(u.createdAt).toLocaleDateString() },
            { key: 'actions', label: 'Action', render: (u) => (
              <button onClick={() => openChangeRole(u)} style={{ padding: '6px 12px', fontSize: 12 }}>Change Role</button>
            ) },
          ]}
          rows={users}
          empty="No users found."
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Change Role — ${selected?.name || ''}`}>
        <label>New Role
          <select className="eco-input" value={newRole} onChange={e => setNewRole(e.target.value)}>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </label>
        <button type="button" onClick={saveRole}>Save Role</button>
      </Modal>
    </div>
    </div>
  );
};

export default UserManagement;