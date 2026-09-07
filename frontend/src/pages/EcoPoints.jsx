import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ROLE_LABELS = {
  household: 'Household',
  collector: 'Collector',
  recycling_company: 'Recycling Co.',
  business: 'Business',
  admin: 'Admin',
};

const RANK_MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const EcoPoints = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [meRes, lbRes, ratesRes] = await Promise.all([
          api.get('/ecopoints/me'),
          api.get('/ecopoints/leaderboard'),
          api.get('/ecopoints/rates'),
        ]);
        setData(meRes.data.data);
        setLeaderboard(lbRes.data.data);
        setRates(ratesRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load EcoPoints data.');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div className="eco-points-hero">
        <div className="eco-points-hero-left">
          <div className="eco-points-icon-big">🌿</div>
          <div>
            <h1 style={{ color: '#fff', margin: 0 }}>EcoPoints</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontSize: 14 }}>
              Earn points by recycling. Every kilogram counts.
            </p>
          </div>
        </div>
        <div className="eco-points-balance-card">
          <div className="eco-points-balance-label">Current Balance</div>
          <div className="eco-points-balance-value">{user?.ecoPoints || 0}</div>
          <div className="eco-points-balance-unit">EcoPoints</div>
        </div>
      </div>

      {error && <div className="error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats Row */}
      {data && (
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{data.totalEarned}</div>
            <div className="stat-label">Total Points Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">♻️</div>
            <div className="stat-value">{data.totalTransactions}</div>
            <div className="stat-label">Recycling Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{data.averagePerTransaction}</div>
            <div className="stat-label">Avg. Points / Transaction</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🌍</div>
            <div className="stat-value">{leaderboard?.currentUserRank?.rank || (leaderboard?.leaderboard?.findIndex(e => e.isCurrentUser) + 1) || '—'}</div>
            <div className="stat-label">Your Leaderboard Rank</div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="eco-tabs">
        {['overview', 'history', 'rates', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            className={`eco-tab-btn${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ margin: 0 }}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'history' && '📜 History'}
            {tab === 'rates' && '💡 How to Earn'}
            {tab === 'leaderboard' && '🏅 Leaderboard'}
          </button>
        ))}
      </div>

      {/* Tab: Overview — Category Breakdown */}
      {activeTab === 'overview' && data && (
        <div>
          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Points by Category</h2>
          {data.categoryBreakdown.length === 0 ? (
            <div className="empty-state">
              No points earned yet. Complete a recycling transaction to start earning!
            </div>
          ) : (
            <div className="eco-breakdown-list">
              {data.categoryBreakdown.map((cat) => {
                const pct = data.totalEarned > 0 ? Math.round((cat.points / data.totalEarned) * 100) : 0;
                return (
                  <div key={cat.name} className="eco-breakdown-item">
                    <div className="eco-breakdown-top">
                      <span className="eco-breakdown-name">
                        ♻️ {cat.name}
                      </span>
                      <span className="eco-breakdown-pts">{cat.points} pts</span>
                    </div>
                    <div className="eco-progress-bar">
                      <div className="eco-progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                    <div className="eco-breakdown-sub">
                      {cat.transactions} transaction{cat.transactions !== 1 ? 's' : ''} · {pct}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: History */}
      {activeTab === 'history' && data && (
        <div>
          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Points History</h2>
          {data.history.length === 0 ? (
            <div className="empty-state">No completed transactions yet. Recycle to earn EcoPoints!</div>
          ) : (
            <div className="eco-history-list">
              {data.history.map((item) => (
                <div key={item.id} className="eco-history-item">
                  <div className="eco-history-left">
                    <div className="eco-history-icon">♻️</div>
                    <div>
                      <div className="eco-history-title">{item.listingTitle}</div>
                      <div className="eco-history-meta">
                        {item.category} · {item.weight} {item.unit} · {item.role} · {item.counterparty}
                      </div>
                      <div className="eco-history-date">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="eco-history-points">+{item.pointsEarned} pts</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: How to Earn (Rates) */}
      {activeTab === 'rates' && (
        <div>
          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 8 }}>Earning Rates by Material</h2>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
            EcoPoints are awarded to both the seller and the collector when a transaction is completed.
          </p>
          {rates.length === 0 ? (
            <div className="empty-state">No categories available.</div>
          ) : (
            <div className="eco-rates-grid">
              {rates.map((cat) => (
                <div key={cat._id} className="eco-rate-card">
                  <div className="eco-rate-icon">♻️</div>
                  <div className="eco-rate-name">{cat.name}</div>
                  <div className="eco-rate-value">{cat.defaultPointsPerKg}</div>
                  <div className="eco-rate-unit">pts / kg</div>
                  <div className="eco-rate-price">Market: ৳{cat.defaultPricePerKg}/kg</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Leaderboard */}
      {activeTab === 'leaderboard' && leaderboard && (
        <div>
          <h2 style={{ fontSize: 18, color: '#1a2e23', marginBottom: 16 }}>Top EcoPoints Earners</h2>
          <div className="eco-leaderboard">
            {leaderboard.leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`eco-lb-item${entry.isCurrentUser ? ' is-me' : ''}`}
              >
                <div className="eco-lb-rank">
                  {RANK_MEDALS[entry.rank] || `#${entry.rank}`}
                </div>
                <div className="eco-lb-info">
                  <div className="eco-lb-name">
                    {entry.name} {entry.isCurrentUser && <span className="eco-lb-you-badge">You</span>}
                  </div>
                  <div className="eco-lb-role">{ROLE_LABELS[entry.role] || entry.role}</div>
                </div>
                <div className="eco-lb-points">{entry.ecoPoints} <span>pts</span></div>
              </div>
            ))}

            {/* Show current user rank if outside top 10 */}
            {leaderboard.currentUserRank && (
              <>
                <div className="eco-lb-separator">· · ·</div>
                <div className="eco-lb-item is-me">
                  <div className="eco-lb-rank">#{leaderboard.currentUserRank.rank}</div>
                  <div className="eco-lb-info">
                    <div className="eco-lb-name">
                      {leaderboard.currentUserRank.name}{' '}
                      <span className="eco-lb-you-badge">You</span>
                    </div>
                    <div className="eco-lb-role">{ROLE_LABELS[leaderboard.currentUserRank.role] || leaderboard.currentUserRank.role}</div>
                  </div>
                  <div className="eco-lb-points">{leaderboard.currentUserRank.ecoPoints} <span>pts</span></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcoPoints;
