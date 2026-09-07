import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';

const TYPE_LABELS = {
  totalWeight: 'Total Weight Recycled',
  categoryWeight: 'Weight of a Specific Material',
  ecoPoints: 'EcoPoints Earned',
};

const STATUS_COLORS = { active: '#3b82f6', completed: '#10b981', expired: '#ef4444' };

const defaultEndDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
};

const DEFAULT_FORM = { type: 'totalWeight', category: '', targetValue: 50, endDate: defaultEndDate() };

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [gRes, cRes] = await Promise.all([
        api.get('/goals/mine'),
        api.get('/categories').catch(() => ({ data: { data: [] } })),
      ]);
      setGoals(gRes.data.data);
      setCategories(cRes.data.data || []);
    } catch {
      showMsg('Failed to load goals.', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => { setForm(DEFAULT_FORM); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        type: form.type,
        targetValue: Number(form.targetValue),
        endDate: form.endDate,
        category: form.type === 'categoryWeight' ? form.category : undefined,
      };
      const { data } = await api.post('/goals', payload);
      setGoals([data.data, ...goals]);
      setShowModal(false);
      showMsg('Goal created!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Failed to create goal.', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      setGoals(goals.filter((g) => g._id !== id));
      showMsg('Goal deleted.');
    } catch {
      showMsg('Delete failed.', 'error');
    }
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const pastGoals = goals.filter((g) => g.status !== 'active');

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>My Recycling Goals</h1>
          <p className="subtitle">Set a target and track your progress toward it.</p>
        </div>
        <button onClick={openCreate}>+ New Goal</button>
      </div>

      {msg.text && (
        <div className={msg.type === 'error' ? 'error' : 'success'} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      ) : (
        <>
          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Active Goals ({activeGoals.length})</h2>
          {activeGoals.length === 0 ? (
            <div className="empty-state" style={{ marginBottom: 28 }}>No active goals. Set one to get started!</div>
          ) : (
            <div className="goal-list" style={{ marginBottom: 28 }}>
              {activeGoals.map((g) => (
                <div key={g._id} className="goal-card">
                  <div className="goal-card-top">
                    <div>
                      <div className="goal-title">{TYPE_LABELS[g.type]}{g.category?.name ? ` · ${g.category.name}` : ''}</div>
                      <div className="goal-meta">By {new Date(g.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <button onClick={() => handleDelete(g._id)} style={{ background: '#6b7280', fontSize: 12, padding: '6px 12px' }}>Delete</button>
                  </div>
                  <div className="eco-progress-bar" style={{ height: 10 }}>
                    <div className="eco-progress-fill" style={{ width: `${g.percent}%` }}></div>
                  </div>
                  <div className="goal-progress-text">{g.current} / {g.targetValue} {g.unit} ({g.percent}%)</div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Past Goals ({pastGoals.length})</h2>
          {pastGoals.length === 0 ? (
            <div className="empty-state">No completed or expired goals yet.</div>
          ) : (
            <div className="goal-list">
              {pastGoals.map((g) => (
                <div key={g._id} className="goal-card">
                  <div className="goal-card-top">
                    <div>
                      <div className="goal-title">{TYPE_LABELS[g.type]}{g.category?.name ? ` · ${g.category.name}` : ''}</div>
                      <div className="goal-meta">{g.current} / {g.targetValue} {g.unit}</div>
                    </div>
                    <span
                      className="status-badge"
                      style={{ background: STATUS_COLORS[g.status] + '22', color: STATUS_COLORS[g.status], position: 'static', fontSize: 12 }}
                    >
                      {g.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Recycling Goal">
        <form onSubmit={handleSave}>
          <label>Goal Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="totalWeight">Total Weight Recycled</option>
              <option value="categoryWeight">Weight of a Specific Material</option>
              <option value="ecoPoints">EcoPoints Earned</option>
            </select>
          </label>
          {form.type === 'categoryWeight' && (
            <label>Material
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select a material...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </label>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>Target ({form.type === 'ecoPoints' ? 'points' : 'kg'})
              <input required type="number" min="1" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} />
            </label>
            <label>By Date
              <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </label>
          </div>
          <button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Goal'}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Goals;
