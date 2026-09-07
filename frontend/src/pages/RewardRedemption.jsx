import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const CATEGORY_ICONS = {
  voucher: '🎟️',
  discount: '💸',
  donation: '🌳',
  product: '📦',
};

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Fulfilled: '#10b981',
  Cancelled: '#ef4444',
};

const RewardRedemption = () => {
  const { user, reloadUser } = useAuth();
  const [rewards, setRewards] = useState([]);
  const [myRedemptions, setMyRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [redeeming, setRedeeming] = useState(null);
  const [confirmReward, setConfirmReward] = useState(null);

  const showMsg = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, mRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/redemptions/mine'),
      ]);
      setRewards(rRes.data.data);
      setMyRedemptions(mRes.data.data);
    } catch {
      showMsg('Failed to load data.', 'error');
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRedeem = async () => {
    if (!confirmReward) return;
    setRedeeming(confirmReward._id);
    setConfirmReward(null);
    try {
      const { data } = await api.post('/redemptions', { rewardId: confirmReward._id });
      showMsg(data.message, 'success');
      await reloadUser();
      await fetchAll();
    } catch (err) {
      showMsg(err.response?.data?.message || 'Redemption failed.', 'error');
    }
    setRedeeming(null);
  };

  const currentBalance = user?.ecoPoints || 0;

  return (
    <div className="page-container">
      {/* Hero */}
      <div className="reward-hero">
        <div className="reward-hero-left">
          <div style={{ fontSize: 48 }}>🎁</div>
          <div>
            <h1 style={{ color: '#fff', margin: 0 }}>Reward Redemption</h1>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: '4px 0 0', fontSize: 14 }}>
              Spend your EcoPoints on real rewards. Keep recycling to earn more!
            </p>
          </div>
        </div>
        <div className="reward-balance-card">
          <div className="reward-balance-label">Your Balance</div>
          <div className="reward-balance-value">{currentBalance}</div>
          <div className="reward-balance-unit">EcoPoints</div>
        </div>
      </div>

      {/* Message */}
      {msg.text && (
        <div className={msg.type === 'error' ? 'error' : 'success'} style={{ marginBottom: 20 }}>
          {msg.text}
        </div>
      )}

      {/* Tabs */}
      <div className="eco-tabs">
        <button
          className={`eco-tab-btn${activeTab === 'browse' ? ' active' : ''}`}
          onClick={() => setActiveTab('browse')}
          style={{ margin: 0 }}
        >
          🎁 Browse Rewards
        </button>
        <button
          className={`eco-tab-btn${activeTab === 'history' ? ' active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{ margin: 0 }}
        >
          📜 My Redemptions {myRedemptions.length > 0 && `(${myRedemptions.length})`}
        </button>
      </div>

      {loading ? (
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      ) : (
        <>
          {/* Browse Rewards */}
          {activeTab === 'browse' && (
            <div>
              {rewards.length === 0 ? (
                <div className="empty-state">No rewards available right now. Check back soon!</div>
              ) : (
                <div className="reward-grid">
                  {rewards.map((reward) => {
                    const canAfford = currentBalance >= reward.pointsCost;
                    const outOfStock = reward.stock === 0;
                    const isProcessing = redeeming === reward._id;
                    return (
                      <div key={reward._id} className={`reward-card${!canAfford || outOfStock ? ' reward-card-disabled' : ''}`}>
                        <div className="reward-card-top">
                          <div className="reward-cat-icon">{CATEGORY_ICONS[reward.category] || '🎁'}</div>
                          <span className={`reward-cat-badge reward-cat-${reward.category}`}>
                            {reward.category}
                          </span>
                          {outOfStock && <span className="reward-stock-badge">Out of Stock</span>}
                        </div>
                        <h3 className="reward-name">{reward.name}</h3>
                        <p className="reward-desc">{reward.description}</p>
                        {reward.stock > 0 && (
                          <p className="reward-stock-left">⚡ {reward.stock} left</p>
                        )}
                        {reward.stock === -1 && (
                          <p className="reward-stock-left">∞ Unlimited</p>
                        )}
                        <div className="reward-footer">
                          <div className="reward-cost">
                            <span className="reward-cost-value">{reward.pointsCost}</span>
                            <span className="reward-cost-unit"> pts</span>
                          </div>
                          <button
                            className="reward-btn"
                            disabled={!canAfford || outOfStock || isProcessing}
                            onClick={() => setConfirmReward(reward)}
                            title={!canAfford ? `Need ${reward.pointsCost - currentBalance} more points` : ''}
                          >
                            {isProcessing ? '...' : !canAfford ? `Need ${reward.pointsCost - currentBalance} more` : 'Redeem'}
                          </button>
                        </div>
                        {!canAfford && !outOfStock && (
                          <div className="reward-progress-bar" style={{ marginTop: 8 }}>
                            <div
                              className="reward-progress-fill"
                              style={{ width: `${Math.min(100, (currentBalance / reward.pointsCost) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* My Redemptions */}
          {activeTab === 'history' && (
            <div>
              {myRedemptions.length === 0 ? (
                <div className="empty-state">No redemptions yet. Browse rewards and redeem your first one!</div>
              ) : (
                <div className="redemption-list">
                  {myRedemptions.map((r) => (
                    <div key={r._id} className="redemption-item">
                      <div className="redemption-left">
                        <div style={{ fontSize: 28 }}>{CATEGORY_ICONS[r.reward?.category] || '🎁'}</div>
                        <div>
                          <div className="redemption-name">{r.reward?.name || 'Unknown Reward'}</div>
                          <div className="redemption-meta">
                            {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            &nbsp;·&nbsp;{r.pointsSpent} pts spent
                          </div>
                          <div className="redemption-code-wrap">
                            Code: <span className="redemption-code">{r.redemptionCode}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <span
                          className="status-badge"
                          style={{ background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status], position: 'static', fontSize: 12 }}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Confirm Redemption Modal */}
      <Modal isOpen={!!confirmReward} onClose={() => setConfirmReward(null)} title="Confirm Redemption">
        {confirmReward && (
          <div>
            <p style={{ fontSize: 15, marginTop: 0 }}>
              Are you sure you want to redeem <strong>{confirmReward.name}</strong>?
            </p>
            <div className="redemption-confirm-info">
              <div>Cost: <strong style={{ color: '#1f8a5f' }}>{confirmReward.pointsCost} EcoPoints</strong></div>
              <div>Your balance after: <strong>{currentBalance - confirmReward.pointsCost} pts</strong></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleRedeem} style={{ flex: 1 }}>✅ Confirm Redemption</button>
              <button onClick={() => setConfirmReward(null)} style={{ flex: 1, background: '#6b7280' }}>Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RewardRedemption;
