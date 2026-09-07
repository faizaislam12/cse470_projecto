import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const BAR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1'];

const MyPerformance = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try { const { data } = await api.get('/collectors/me'); setData(data.data); } catch {}
    setLoading(false);
  };

  if (!user) return null;
  if (user.role !== 'collector') return <div className="page-container"><h2>Access Denied — this dashboard is for collectors.</h2></div>;

  if (loading) return <div className="spinner-center"><div className="spinner-lg"></div></div>;

  const waste = Object.entries(data.wasteByMaterial || {}).sort((a, b) => b[1] - a[1]);
  const maxWaste = Math.max(1, ...waste.map(([, v]) => v));
  const stats = data.totals;
  const month = data.thisMonth;

  return (
    <div className="eco-dark">
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">My Performance</span></h1><p className="subtitle">Hello, {data.name}! Here's your collection summary.</p></div>
        <span className="eco-badge" style={{ fontSize: 15 }}>⭐ {data.ecoPoints} EcoPoints</span>
      </div>

      <div className="stats-grid" style={{ marginTop: 0 }}>
        <div className="stat-card"><div className="stat-icon">📥</div><div className="stat-value">{stats.totalPickups}</div><div className="stat-label">Total Pickups</div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-value">{stats.completedPickups}</div><div className="stat-label">Completed</div></div>
        <div className="stat-card"><div className="stat-icon">🎯</div><div className="stat-value">{stats.successRate}%</div><div className="stat-label">Success Rate</div></div>
        <div className="stat-card"><div className="stat-icon">⚖️</div><div className="stat-value">{stats.totalWeight} kg</div><div className="stat-label">Total Collection</div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">৳ {stats.totalEarnings}</div><div className="stat-label">Total Earnings</div></div>
        <div className="stat-card"><div className="stat-icon">🌟</div><div className="stat-value">{stats.ecoPointsEarned}</div><div className="stat-label">EcoPoints Earned</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginTop: 24 }}>
        <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>This Month</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div><div className="stat-value" style={{ fontSize: 22 }}>{month.pickups}</div><div className="stat-label">Pickups</div></div>
            <div><div className="stat-value" style={{ fontSize: 22 }}>{month.weight} kg</div><div className="stat-label">Weight</div></div>
            <div><div className="stat-value" style={{ fontSize: 22 }}>৳ {month.earnings}</div><div className="stat-label">Earnings</div></div>
          </div>
        </div>

        <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Collected by Material (kg)</h3>
          {waste.length === 0 && <p className="eco-muted" style={{ fontSize: 13 }}>Complete a pickup to see your breakdown.</p>}
          {waste.map(([mat, kg], i) => (
            <div key={mat} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{mat}</span><strong>{Math.round(kg * 100) / 100} kg</strong>
              </div>
              <div className="eco-progress-bar">
                <div className="eco-progress-fill" style={{ width: `${(kg / maxWaste) * 100}%`, background: BAR_COLORS[i % BAR_COLORS.length] }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Recent Pickups</h3>
        {data.recent.length === 0 ? <p className="eco-muted">No pickups yet.</p> : (
          <div className="eco-history-list">
            {data.recent.map((p) => (
              <div key={p._id} className="eco-history-item">
                <div className="eco-history-left">
                  <div>
                    <div className="eco-history-title">{p.listing?.title || 'Pickup'}</div>
                    <div className="eco-history-meta">{p.listing?.weight || 0} kg · {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : '—'} · Status: {p.status.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default MyPerformance;