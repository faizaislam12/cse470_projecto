import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'SYSTEM', broadcast: true, userId: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
    } catch {}
    setLoading(false);
  };

  const openSend = async () => {
    setShowModal(true);
    try { const { data } = await api.get('/admin/users'); setUsers(data.data); } catch {}
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, userId: form.userId || undefined };
      const { data } = await api.post('/notifications', payload);
      setMsg(data.message || 'Notification sent.');
      setShowModal(false);
      setForm({ title: '', message: '', type: 'SYSTEM', broadcast: true, userId: '' });
      fetchNotifications();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to send.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  const remove = async (id) => {
    try { await api.delete(`/notifications/${id}`); fetchNotifications(); } catch {}
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Notification Center</h1><p className="subtitle">Broadcast updates to everyone or message a single user.</p></div>
        <button onClick={openSend}>+ Send Notification</button>
      </div>
      {msg && <div className="success">{msg}</div>}

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : (
        <DataTable
          columns={[
            { key: 'title', label: 'Title', render: (n) => <strong>{n.title} {!n.isRead && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '2px 7px', fontSize: 10, marginLeft: 6 }}>NEW</span>}</strong> },
            { key: 'message', label: 'Message', render: (n) => <span style={{ color: '#666' }}>{n.message}</span> },
            { key: 'recipient', label: 'Recipient', render: (n) => n.user ? `${n.user.name} (${n.user.email})` : '—' },
            { key: 'type', label: 'Type', render: (n) => (
              <span style={{ background: 'rgba(139,92,246,0.12)', color: '#7c3aed', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{n.type}</span>
            ) },
            { key: 'createdAt', label: 'Sent', render: (n) => new Date(n.createdAt).toLocaleString() },
            { key: 'actions', label: '', render: (n) => <button onClick={() => remove(n._id)} style={{ padding: '5px 10px', fontSize: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Delete</button> },
          ]}
          rows={notifications}
          empty="No notifications sent yet."
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification">
        <form onSubmit={sendNotification}>
          <label>Title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. System Update" /></label>
          <label>Message<textarea rows={3} required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ width: '100%', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, resize: 'vertical' }} /></label>
          <label>Type
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['SYSTEM', 'OFFER', 'COUNTER_OFFER', 'PICKUP', 'CAMPAIGN', 'REWARD', 'TRANSACTION'].map(t => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <input type="checkbox" checked={form.broadcast} onChange={e => setForm({ ...form, broadcast: e.target.checked })} style={{ width: 18, height: 18 }} />
            Broadcast to all users
          </label>
          {!form.broadcast && (
            <label>Recipient
              <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} required>
                <option value="">Select a user…</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </label>
          )}
          <button type="submit">Send</button>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationCenter;