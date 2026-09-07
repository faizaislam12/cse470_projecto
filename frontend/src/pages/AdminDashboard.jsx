import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CARD_STYLES = [
  { borderTopColor: '#10b981', icon: '👥' },
  { borderTopColor: '#3b82f6', icon: '♻️' },
  { borderTopColor: '#f59e0b', icon: '🧾' },
  { borderTopColor: '#8b5cf6', icon: '🌟' },
  { borderTopColor: '#ef4444', icon: '📦' },
  { borderTopColor: '#14b8a6', icon: '🏢' },
];

const TREND_COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6'];

const AdminDashboard = () => {
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

  const cards = data ? [
    { label: 'Total Users', value: data.totals.users },
    { label: 'Recycled (kg)', value: data.totals.totalWasteKg },
    { label: 'Completed Transactions', value: data.totals.transactions },
    { label: 'EcoPoints Issued', value: data.totals.ecoPointsIssued },
    { label: 'Pickups Completed', value: data.totals.completedPickups },
    { label: 'Approved Businesses', value: data.totals.verifiedBusinesses },
  ] : [];

  const quickLinks = [
    { to: '/admin/users', label: '👥 User Management' },
    { to: '/admin/businesses', label: '🏢 Business Accounts' },
    { to: '/admin/campaigns', label: '📣 Campaigns' },
    { to: '/admin/collectors', label: '♻️ Collector Performance' },
    { to: '/admin/analytics', label: '📊 Analytics' },
    { to: '/admin/notifications', label: '🔔 Notification Center' },
    { to: '/admin/categories', label: '🗂️ Material Categories' },
    { to: '/admin/rewards', label: '🎁 Rewards Management' },
  ];

  const maxTrend = data ? Math.max(1, ...data.monthlyTrend.map((m) => m.weight)) : 1;

  return (
    <div className="eco-dark">
    <div className="page-container">
      <div className="page-header">
        <div><h1><span className="eco-gradient-text">Admin Dashboard</span></h1><p className="subtitle">Platform-wide overview of GreenLoop.</p></div>
      </div>

      {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> : data ? (
        <>
          <div className="stats-grid" style={{ marginTop: 0 }}>
            {cards.map((c, i) => (
              <div key={c.label} className="stat-card" style={{ borderTopColor: CARD_STYLES[i]?.borderTopColor }}>
                <div className="stat-icon">{CARD_STYLES[i]?.icon}</div>
                <div className="stat-value">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
                <div className="stat-label">{c.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginTop: 24 }}>
            <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Monthly Recycled Weight (kg)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
                {data.monthlyTrend.map((m) => (
                  <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                      <div style={{ width: '70%', background: 'linear-gradient(180deg,#10b981,#1f8a5f)', borderRadius: '6px 6px 2px 2px', height: `${Math.max(3, (m.weight / maxTrend) * 100)}%`, transition: 'height .5s' }} title={`${m.weight} kg`}></div>
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(233,253,245,0.5)', marginTop: 6, whiteSpace: 'nowrap' }}>{m.month.slice(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="eco-glass" style={{ borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 16 }}>Players by Role</h3>
              {data.roleDistribution.map((r, i) => (
                <div key={r.role} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{r.label}</span><strong>{r.count}</strong>
                  </div>
                  <div className="eco-progress-bar">
                    <div className="eco-progress-fill" style={{ width: `${data.totals.users ? (r.count / data.totals.users) * 100 : 0}%`, background: TREND_COLORS[i % TREND_COLORS.length] }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 18, marginBottom: 14 }}>Manage Platform</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(215px, 1fr))', gap: 12 }}>
              {quickLinks.map((q) => (
                <Link key={q.to} to={q.to} className="eco-quick-link eco-glass" style={{ borderRadius: 12 }}>
                  {q.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : <p className="eco-muted">Could not load analytics. Is the backend running?</p>}
    </div>
    </div>
  );
};

export default AdminDashboard;