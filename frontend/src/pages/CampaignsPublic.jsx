import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CAMPAIGN_COLOR = { Upcoming: '#f59e0b', Active: '#10b981', Ended: '#3b82f6' };

const CampaignsPublic = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [joined, setJoined] = useState({});
  const [detail, setDetail] = useState(null);

  useEffect(() => { fetchCampaigns(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/campaigns');
      setCampaigns(data.data);
      const detailMap = {};
      for (const c of data.data) {
        try {
          const d = await api.get(`/campaigns/${c._id}`);
          detailMap[c._id] = d.data.data.participants.some((p) => String(p.user) === String(user?._id));
        } catch {}
      }
      setJoined(detailMap);
    } catch {}
    setLoading(false);
  };

  const toggleJoin = async (c) => {
    try {
      if (joined[c._id]) {
        await api.post(`/campaigns/${c._id}/leave`);
        setMsg(`Left "${c.title}".`);
      } else {
        await api.post(`/campaigns/${c._id}/join`);
        setMsg(`Joined "${c.title}"!`);
      }
      fetchCampaigns();
    } catch (err) { setMsg(err.response?.data?.message || 'Action failed.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  const contribute = async (c) => {
    const kg = window.prompt(`How many kg have you collected for "${c.title}"?`, '1');
    if (!kg || isNaN(Number(kg)) || Number(kg) <= 0) return;
    try {
      await api.patch(`/campaigns/${c._id}/contribute`, { contributionKg: Number(kg) });
      setMsg(`Contribution of ${kg} kg recorded!`);
      fetchCampaigns();
      setDetail(null);
    } catch (err) { setMsg(err.response?.data?.message || 'Failed to record contribution.'); }
    setTimeout(() => setMsg(''), 4000);
  };

  const viewDetail = async (c) => { setDetail(c); };

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;

  const campaignsToShow = campaigns.filter(c => c.status !== 'Ended');

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1>Recycling Campaigns</h1><p className="subtitle">Join community campaigns and track collective progress.</p></div>
      </div>
      {msg && <div className="success">{msg}</div>}

      {campaignsToShow.length === 0 && <p style={{ color: '#999' }}>No active or upcoming campaigns right now.</p>}

      <div className="listing-grid">
        {campaignsToShow.map((c) => {
          const progress = c.targetWeight ? Math.min(100, Math.round(((c.currentWeight || 0) / c.targetWeight) * 100)) : 0;
          return (
            <div key={c._id} className="listing-card" style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', top: 10, right: 10, background: `${(CAMPAIGN_COLOR[c.status] || '#999')}1A`, color: CAMPAIGN_COLOR[c.status] || '#999', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{c.status}</span>
              <div className="listing-body">
                <h3>{c.title}</h3>
                <p className="listing-desc">{c.description}</p>
                <div className="eco-progress-bar" style={{ margin: '12px 0 6px' }}>
                  <div className="eco-progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="listing-meta">
                  <span>{progress}% complete</span>
                  <span>{c.currentWeight || 0} / {c.targetWeight || 0} kg</span>
                </div>
                <div className="listing-meta" style={{ marginTop: 8 }}>
                  <span>📅 {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'} to {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button onClick={() => toggleJoin(c)} disabled={c.status === 'Ended'}>
                    {joined[c._id] ? 'Leave Campaign' : 'Join Campaign'}
                  </button>
                  <button style={{ background: 'linear-gradient(135deg,#3b82f6,#2563eb)' }} onClick={() => viewDetail(c)}>Details</button>
                </div>
                {joined[c._id] && c.status === 'Active' && (
                  <button style={{ background: 'linear-gradient(135deg,#1f8a5f,#10b981)', marginTop: 8 }} onClick={() => contribute(c)}>+ Log Contribution</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{detail.title}</h2><button className="modal-close" onClick={() => setDetail(null)}>✕</button></div>
            <p style={{ color: '#666', marginBottom: 16 }}>{detail.description}</p>
            <div className="listing-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', marginBottom: 16 }}>
              <div className="stat-card" style={{ margin: 0 }}><div className="stat-value">{detail.currentWeight || 0}</div><div className="stat-label">Collected (kg)</div></div>
              <div className="stat-card" style={{ margin: 0 }}><div className="stat-value">{detail.targetWeight || 0}</div><div className="stat-label">Target (kg)</div></div>
              <div className="stat-card" style={{ margin: 0 }}><div className="stat-value">{detail.participants?.length || 0}</div><div className="stat-label">Participants</div></div>
            </div>
            {detail.participants?.length > 0 && (
              <>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>Participants</h3>
                {detail.participants.map((p) => (
                  <div key={String(p._id)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eef2f0', fontSize: 13 }}>
                    <span>{p.name} {String(p.user) === String(user?._id) && <strong style={{ color: '#1f8a5f' }}>(you)</strong>}</span>
                    <span style={{ color: '#888' }}>{p.contributionKg || 0} kg {p.isSponsor && '· 🏢 sponsor'}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignsPublic;