import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const CATEGORY_ICONS = { voucher: '🎟️', discount: '💸', donation: '🌳', product: '📦' };
const STATUS_COLORS = { Pending: '#f59e0b', Fulfilled: '#10b981', Cancelled: '#ef4444' };

const DEFAULT_FORM = { name: '', description: '', pointsCost: 100, category: 'voucher', stock: -1, isActive: true };

const AdminRewards = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('rewards');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [actionId, setActionId] = useState(null);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, rdRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/redemptions'),
      ]);
      setRewards(rRes.data.data);
      setRedemptions(rdRes.data.data);
    } catch {
      showMsg('Failed to load data.', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (user?.role !== 'admin') {
    return <div className="page-container"><h2>Access Denied</h2></div>;
  }

  const openCreate = () => { setEditingId(null); setForm(DEFAULT_FORM); setShowModal(true); };
  const openEdit = (r) => { setEditingId(r._id); setForm({ name: r.name, description: r.description, pointsCost: r.pointsCost, category: r.category, stock: r.stock, isActive: r.isActive }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, pointsCost: Number(form.pointsCost), stock: Number(form.stock) };
      if (editingId) {
        const { data } = await api.put(`/rewards/${editingId}`, payload);
        setRewards(rewards.map(r => r._id === editingId ? data.data : r));
        showMsg('Reward updated!');
      } else {
        const { data } = await api.post('/rewards', payload);
        setRewards([data.data, ...rewards]);
        showMsg('Reward created!');
      }
      setShowModal(false);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Save failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reward?')) return;
    try {
      await api.delete(`/rewards/${id}`);
      setRewards(rewards.filter(r => r._id !== id));
      showMsg('Reward deleted.');
    } catch {
      showMsg('Delete failed.', 'error');
    }
  };

  const toggleActive = async (reward) => {
    try {
      const { data } = await api.put(`/rewards/${reward._id}`, { isActive: !reward.isActive });
      setRewards(rewards.map(r => r._id === reward._id ? data.data : r));
      showMsg(`Reward ${data.data.isActive ? 'activated' : 'deactivated'}.`);
    } catch {
      showMsg('Toggle failed.', 'error');
    }
  };

  const handleRedemptionStatus = async (id, status) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await api.put(`/redemptions/${id}`, { status });
      setRedemptions(redemptions.map(r => r._id === id ? data.data : r));
      showMsg(`Marked as ${status}.`);
    } catch (err) {
      showMsg(err.response?.data?.message || 'Update failed.', 'error');
    }
    setActionId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Manage Rewards</h1>
          <p className="subtitle">Create rewards and manage user redemptions.</p>
        </div>
        {activeTab === 'rewards' && (
          <button onClick={openCreate}>+ New Reward</button>
        )}
      </div>

      {msg.text && (
        <div className={msg.type === 'error' ? 'error' : 'success'} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="eco-tabs">
        <button className={`eco-tab-btn${activeTab === 'rewards' ? ' active' : ''}`} onClick={() => setActiveTab('rewards')} style={{ margin: 0 }}>
          🎁 Rewards Catalog ({rewards.length})
        </button>
        <button className={`eco-tab-btn${activeTab === 'redemptions' ? ' active' : ''}`} onClick={() => setActiveTab('redemptions')} style={{ margin: 0 }}>
          📋 All Redemptions ({redemptions.length})
        </button>
      </div>

      {loading ? (
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      ) : (
        <>
          {/* Rewards Catalog */}
          {activeTab === 'rewards' && (
            rewards.length === 0 ? (
              <div className="empty-state">No rewards yet. Create one!</div>
            ) : (
              <div className="listing-grid">
                {rewards.map(r => (
                  <div key={r._id} className="listing-card" style={{ opacity: r.isActive ? 1 : 0.6 }}>
                    <div className="listing-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span className="cat-tag">{CATEGORY_ICONS[r.category]} {r.category}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: r.isActive ? '#10b981' : '#ef4444' }}>
                          {r.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3>{r.name}</h3>
                      <p className="listing-desc">{r.description}</p>
                      <div className="listing-meta">
                        <span>Cost: <strong style={{ color: '#1f8a5f' }}>{r.pointsCost} pts</strong></span>
                        <span>Stock: {r.stock === -1 ? '∞ Unlimited' : r.stock}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                        <button onClick={() => openEdit(r)} style={{ flex: 1, background: '#6b7280', fontSize: 12, padding: '8px 10px' }}>Edit</button>
                        <button onClick={() => toggleActive(r)} style={{ flex: 1, background: r.isActive ? '#f59e0b' : '#10b981', fontSize: 12, padding: '8px 10px' }}>
                          {r.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(r._id)} style={{ flex: 1, background: '#ef4444', fontSize: 12, padding: '8px 10px' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* All Redemptions */}
          {activeTab === 'redemptions' && (
            redemptions.length === 0 ? (
              <div className="empty-state">No redemptions yet.</div>
            ) : (
              <div className="redemption-list">
                {redemptions.map(r => (
                  <div key={r._id} className="redemption-item">
                    <div className="redemption-left">
                      <div style={{ fontSize: 24 }}>{CATEGORY_ICONS[r.reward?.category] || '🎁'}</div>
                      <div>
                        <div className="redemption-name">{r.reward?.name || 'Unknown'}</div>
                        <div className="redemption-meta">
                          {r.user?.name} ({r.user?.email}) · {r.pointsSpent} pts
                        </div>
                        <div className="redemption-code-wrap">
                          Code: <span className="redemption-code">{r.redemptionCode}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                          {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLORS[r.status], background: STATUS_COLORS[r.status] + '22', padding: '3px 10px', borderRadius: 20 }}>
                        {r.status}
                      </span>
                      {r.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => handleRedemptionStatus(r._id, 'Fulfilled')}
                            disabled={actionId === r._id}
                            style={{ background: '#10b981', padding: '6px 12px', fontSize: 12 }}
                          >
                            Fulfill
                          </button>
                          <button
                            onClick={() => handleRedemptionStatus(r._id, 'Cancelled')}
                            disabled={actionId === r._id}
                            style={{ background: '#ef4444', padding: '6px 12px', fontSize: 12 }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Create / Edit Reward Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Reward' : 'Create Reward'}>
        <form onSubmit={handleSave}>
          <label>Reward Name <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 10% Discount Voucher" /></label>
          <label>Description
            <textarea required rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'none', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14 }} />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Points Cost <input required type="number" min="1" value={form.pointsCost} onChange={e => setForm({ ...form, pointsCost: e.target.value })} /></label>
            <label>Category
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="voucher">🎟️ Voucher</option>
                <option value="discount">💸 Discount</option>
                <option value="donation">🌳 Donation</option>
                <option value="product">📦 Product</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Stock (-1 = unlimited) <input required type="number" min="-1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></label>
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 22 }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ width: 16, height: 16 }} />
              Active
            </label>
          </div>
          <button type="submit">{editingId ? 'Update Reward' : 'Create Reward'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default AdminRewards;
