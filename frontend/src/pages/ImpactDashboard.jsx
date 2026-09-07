import { useState, useEffect } from 'react';
import api from '../api/axios';

const ImpactDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImpact = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/impact/me');
        setData(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load impact data.');
      }
      setLoading(false);
    };
    fetchImpact();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      </div>
    );
  }

  const maxMonthWeight = data ? Math.max(1, ...data.monthlyTrend.map((m) => m.weight)) : 1;
  const maxCategoryWeight = data ? Math.max(1, ...data.categoryBreakdown.map((c) => c.weight)) : 1;

  return (
    <div className="page-container">
      <div className="impact-hero">
        <div className="impact-hero-left">
          <div style={{ fontSize: 48 }}>🌍</div>
          <div>
            <h1 style={{ color: '#fff', margin: 0 }}>Environmental Impact</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontSize: 14 }}>
              See the real-world difference your recycling has made.
            </p>
          </div>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 20 }}>{error}</div>}

      {data && (
        <>
          <div className="stats-grid" style={{ marginBottom: 28 }}>
            <div className="stat-card">
              <div className="stat-icon">♻️</div>
              <div className="stat-value">{data.totalWeight} kg</div>
              <div className="stat-label">Total Weight Recycled</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌫️</div>
              <div className="stat-value">{data.co2SavedKg} kg</div>
              <div className="stat-label">CO₂ Emissions Saved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💧</div>
              <div className="stat-value">{data.waterSavedLiters} L</div>
              <div className="stat-label">Water Saved</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🌳</div>
              <div className="stat-value">{data.treesEquivalent}</div>
              <div className="stat-label">Trees Equivalent</div>
            </div>
          </div>

          <div className="impact-columns">
            <div>
              <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Impact by Material</h2>
              {data.categoryBreakdown.length === 0 ? (
                <div className="empty-state">No completed transactions yet. Recycle to build your impact!</div>
              ) : (
                <div className="eco-breakdown-list">
                  {data.categoryBreakdown.map((cat) => (
                    <div key={cat.name} className="eco-breakdown-item">
                      <div className="eco-breakdown-top">
                        <span className="eco-breakdown-name">♻️ {cat.name}</span>
                        <span className="eco-breakdown-pts">{cat.weight} kg</span>
                      </div>
                      <div className="eco-progress-bar">
                        <div
                          className="eco-progress-fill"
                          style={{ width: `${(cat.weight / maxCategoryWeight) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Monthly Trend</h2>
              {data.monthlyTrend.length === 0 ? (
                <div className="empty-state">No monthly data yet.</div>
              ) : (
                <div className="impact-trend">
                  {data.monthlyTrend.map((m) => (
                    <div key={m.month} className="impact-trend-row">
                      <span className="impact-trend-label">{m.month}</span>
                      <div className="eco-progress-bar" style={{ flex: 1 }}>
                        <div
                          className="eco-progress-fill"
                          style={{ width: `${(m.weight / maxMonthWeight) * 100}%` }}
                        ></div>
                      </div>
                      <span className="impact-trend-value">{m.weight} kg</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImpactDashboard;
