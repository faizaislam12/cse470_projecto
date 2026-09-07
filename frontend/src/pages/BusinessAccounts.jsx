import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';

const STATUS_COLOR = { Pending: '#f59e0b', Approved: '#10b981', Rejected: '#ef4444', Suspended: '#8b5cf6' };

const BusinessAccounts = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchBusinesses(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const { data } = await api.get('/businesses', { params });
      setBusinesses(data.data);
    } catch {}
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/businesses/${id}/status`, { status });
      setMsg(`Business marked as ${status}. The owner was notified.`);
      fetchBusinesses();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to update status.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">Business Accounts</span></h1><p className="subtitle">Verify and manage business registrations.</p></div>
      </div>
      {msg && <div className="success">{msg}</div>}

      <div className="filter-bar">
        <select className="eco-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Pending</option><option>Approved</option><option>Rejected</option><option>Suspended</option>
        </select>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : (
        <DataTable glass
          columns={[
            { key: 'businessName', label: 'Business', render: (b) => <strong>{b.businessName}</strong> },
            { key: 'type', label: 'Type', render: (b) => b.businessType },
            { key: 'owner', label: 'Owner', render: (b) => b.user ? b.user.name : '—' },
            { key: 'email', label: 'Contact', render: (b) => b.user ? b.user.email : b.phone },
            { key: 'status', label: 'Status', render: (b) => (
              <span style={{ background: `${(STATUS_COLOR[b.status] || '#999')}1A`, color: STATUS_COLOR[b.status] || '#999', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{b.status}</span>
            ) },
            { key: 'actions', label: 'Actions', render: (b) => b.status === 'Pending' ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => updateStatus(b._id, 'Approved')} style={{ padding: '6px 12px', fontSize: 12 }}>Approve</button>
                <button onClick={() => updateStatus(b._id, 'Rejected')} style={{ padding: '6px 12px', fontSize: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Reject</button>
              </div>
            ) : b.status === 'Approved' ? (
              <button onClick={() => updateStatus(b._id, 'Suspended')} style={{ padding: '6px 12px', fontSize: 12, background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }}>Suspend</button>
            ) : b.status === 'Suspended' ? (
              <button onClick={() => updateStatus(b._id, 'Approved')} style={{ padding: '6px 12px', fontSize: 12 }}>Reactivate</button>
            ) : (
              <button onClick={() => updateStatus(b._id, 'Pending')} style={{ padding: '6px 12px', fontSize: 12 }}>Reconsider</button>
            ) },
          ]}
          rows={businesses}
          empty="No business registrations yet."
        />
      )}
    </div>
  );
};

export default BusinessAccounts;
