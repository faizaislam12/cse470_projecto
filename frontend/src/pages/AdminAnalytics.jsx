import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import DataTable from '../components/DataTable';

const BAR_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1', '#ec4899'];

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try { const { data } = await api.get('/admin/analytics'); setData(data.data); } catch {}
    setLoading(false);
  };

  if (user?.role !== 'admin') return <div className="page-container"><h2>Access Denied</h2></div>;

  const waste = Object.entries(data?.wasteByMaterial || {}).sort((a, b) => b[1] - a[1]);
  const maxWaste = Math.max(1, ...waste.map(([, v]) => v));
  const maxTrend = Math.max(1, ...(data?.monthlyTrend || []).map((m) => m.transactions));

  return (
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">Platform Analytics</span></h1><p className="subtitle">Trends and performance across GreenLoop.</p></div>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : data ? (
        <>
          <div className="stats-grid" style={{ marginTop: 0 }}>
            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value">{data.totals.thisMonthWaste} kg</div><div className="stat-label">Recycled This Month</div></div>
            <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-value">{data.totals.avgRating} / 5</div><div className="stat-label">Avg Feedback ({data.totals.feedbackCount} reviews)</div></div>
            <div className="stat-card"><div className="stat-icon">🧾</div><div className="stat-value">৳ {data.totals.totalRevenue.toLocaleString()}</div><div className="stat-label">Total Transaction Value</div></div>
            <div className="stat-card"><div className="stat-icon">🏆</div><div className="stat-value">{data.totals.campaignsActive}</div><div className="stat-label">Active Campaigns</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, marginTop: 24 }}>
            <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Transactions per Month</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130 }}>
                {data.monthlyTrend.map((m) => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: '70%', background: 'linear-gradient(180deg,#3b82f6,#2563eb)', borderRadius: '6px 6px 2px 2px', height: `${Math.max(3, (m.transactions / maxTrend) * 100)}%` }} title={`${m.transactions} txns, ${m.weight} kg`}></div>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(233,253,245,0.5)', marginTop: 6 }}>{m.month.slice(5)}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'rgba(233,253,245,0.5)', marginTop: 8 }}>Weight: {data.monthlyTrend.map(m => `${m.month.slice(5)}: ${m.weight}kg`).join(' · ')}</p>
            </div>

            <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Waste by Material (kg)</h3>
              {waste.length === 0 && <p className="eco-muted" style={{ fontSize: 13 }}>No completed transactions yet.</p>}
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
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Campaign Progress</h3>
            <DataTable glass
              columns={[
                { key: 'title', label: 'Campaign' },
                { key: 'status', label: 'Status', render: (c) => <span style={{ background: c.status === 'Active' ? 'rgba(16,185,129,0.15)' : c.status === 'Ended' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)', color: c.status === 'Active' ? '#34d399' : c.status === 'Ended' ? '#60a5fa' : '#fbbf24', padding: '3px 10px', borderRadius: 20, fontWeight: 700, fontSize: 11 }}>{c.status}</span> },
                { key: 'participants', label: 'Participants' },
                { key: 'targetWeight', label: 'Target (kg)', render: (c) => c.targetWeight || 0 },
                { key: 'currentWeight', label: 'Current (kg)', render: (c) => c.currentWeight || 0 },
                { key: 'progress', label: 'Progress', render: (c) => (
                  <div style={{ minWidth: 120 }}>
                    <div className="eco-progress-bar"><div className="eco-progress-fill" style={{ width: `${c.progress}%` }}></div></div>
                    <span style={{ fontSize: 11, color: 'rgba(233,253,245,0.55)' }}>{c.progress}%</span>
                  </div>
                ) },
              ]}
              rows={data.campaignPerformance}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>Top Collectors</h3>
            <DataTable glass
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'pickups', label: 'Pickups' },
                { key: 'weight', label: 'Weight (kg)', render: (c) => `${Math.round((c.weight || 0) * 100) / 100}` },
                { key: 'earnings', label: 'Earnings (BDT)', render: (c) => `৳ ${Math.round((c.earnings || 0) * 100) / 100}` },
              ]}
              rows={data.topCollectors}
            />
          </div>
        </>
      ) : <p className="eco-muted">Could not load analytics.</p>}
    </div>
  );
};

export default AdminAnalytics;
