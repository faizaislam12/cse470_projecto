import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const Campaigns = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', targetWeight: 0, status: 'Upcoming' });

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try { const { data } = await api.get('/campaigns'); setCampaigns(data.data); } catch {}
    setLoading(false);
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/campaigns', form);
      setCampaigns([data.data, ...campaigns]);
      setShowModal(false);
      setForm({ title: '', description: '', startDate: '', endDate: '', targetWeight: 0, status: 'Upcoming' });
      setMsg('Campaign created and all users were notified!');
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to create campaign.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  const setStatus = async (id, status) => {
    try {
      await api.patch(`/campaigns/${id}/status`, { status });
      setMsg('Campaign status updated and participants notified.');
      fetchCampaigns();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to update status.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  const removeCampaign = async (id) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setMsg('Campaign deleted.');
      fetchCampaigns();
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to delete.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Campaign Management</h1><p className="subtitle">Create and manage recycling campaigns.</p></div>
        <button onClick={() => setShowModal(true)}>+ New Campaign</button>
      </div>
      {msg && <div className="success">{msg}</div>}

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : (
        <DataTable
          columns={[
            { key: 'title', label: 'Campaign', render: (c) => <strong>{c.title}</strong> },
            { key: 'targetWeight', label: 'Target (kg)', render: (c) => c.targetWeight || 0 },
            { key: 'currentWeight', label: 'Collected (kg)', render: (c) => c.currentWeight || 0 },
            { key: 'status', label: 'Status', render: (c) => (
              <select value={c.status} onChange={e => setStatus(c._id, e.target.value)} style={{ padding: '6px 8px', fontSize: 12 }}>
                {['Upcoming', 'Active', 'Ended'].map(s => <option key={s}>{s}</option>)}
              </select>
            ) },
            { key: 'createdAt', label: 'Created', render: (c) => new Date(c.createdAt).toLocaleDateString() },
            { key: 'actions', label: 'Actions', render: (c) => (
              <button onClick={() => removeCampaign(c._id)} style={{ padding: '6px 12px', fontSize: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>Delete</button>
            ) },
          ]}
          rows={campaigns}
          empty="No campaigns yet."
        />
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Campaign">
        <form onSubmit={createCampaign}>
          <label>Title<input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Cardboard Drive 2026" /></label>
          <label>Description<textarea rows={3} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, resize: 'vertical' }} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Start Date<input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></label>
            <label>End Date<input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></label>
          </div>
          <label>Target Weight (kg)<input required type="number" min="1" value={form.targetWeight} onChange={e => setForm({ ...form, targetWeight: e.target.value })} /></label>
          <label>Initial Status
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Upcoming</option><option>Active</option><option>Ended</option>
            </select>
          </label>
          <button type="submit">Create & Notify All</button>
        </form>
      </Modal>
    </div>
  );
};

export default Campaigns;