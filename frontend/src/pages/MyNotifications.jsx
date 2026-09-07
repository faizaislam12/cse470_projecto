import { useState, useEffect } from 'react';
import api from '../api/axios';

const TYPE_COLOR = {
  SYSTEM: '#7c3aed',
  OFFER: '#3b82f6',
  COUNTER_OFFER: '#f59e0b',
  PICKUP: '#10b981',
  CAMPAIGN: '#ef4444',
  REWARD: '#14b8a6',
  TRANSACTION: '#ec4899',
};

const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications/mine');
      setNotifications(data.data);
      setUnread(data.unread);
    } catch {}
    setLoading(false);
  };

  const markRead = async (n) => {
    if (n.isRead) return;
    try {
      await api.patch(`/notifications/${n._id}/read`);
      fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setMsg('All notifications marked as read.');
      fetchNotifications();
    } catch {}
    setTimeout(() => setMsg(''), 3000);
  };

  const remove = async (id) => {
    try { await api.delete(`/notifications/${id}`); fetchNotifications(); } catch {}
  };

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">Notifications</span></h1><p className="subtitle">{unread > 0 ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : 'You are all caught up.'}</p></div>
        {unread > 0 && <button onClick={markAllRead}>Mark all as read</button>}
      </div>
      {msg && <div className="success">{msg}</div>}

      {notifications.length === 0 ? (
        <p className="eco-muted">No notifications yet.</p>
      ) : (
        <div className="eco-history-list">
          {notifications.map((n) => (
            <div key={n._id} className="eco-history-item" style={{ cursor: n.isRead ? 'default' : 'pointer', borderLeftColor: n.isRead ? '#d1d5db' : TYPE_COLOR[n.type] || '#10b981', opacity: n.isRead ? 0.75 : 1 }} onClick={() => markRead(n)}>
              <div className="eco-history-left">
                <div className="eco-history-icon">🔔</div>
                <div>
                  <div className="eco-history-title">
                    {n.title}
                    {!n.isRead && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '2px 8px', fontSize: 10, marginLeft: 8 }}>NEW</span>}
                  </div>
                  <div className="eco-history-meta">{n.message}</div>
                  <div className="eco-history-date">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <button className="modal-close" style={{ alignSelf: 'center' }} onClick={(e) => { e.stopPropagation(); remove(n._id); }} title="Delete">🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyNotifications;
