import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const STATUS_COLORS = {
  Pending: '#f59e0b',
  Negotiating: '#3b82f6',
  Scheduled: '#8b5cf6',
  Completed: '#10b981',
  Cancelled: '#ef4444'
};

const Transactions = () => {
  const { user, reloadUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [actionId, setActionId] = useState(null);
  const [rateTx, setRateTx] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [ratedIds, setRatedIds] = useState([]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/transactions');
      setTransactions(data.data);
    } catch {
      setMsg('Failed to load history.');
    }
    setLoading(false);
  };

  const submitFeedback = async () => {
    try {
      await api.post('/feedback', { transactionId: rateTx._id, rating, comment });
      setMsg('Thanks! Your rating was submitted.');
      setRatedIds([...ratedIds, rateTx._id]);
      setRateTx(null);
      setComment('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const updateStatus = async (id, status) => {
    if (actionId) return;
    setActionId(id);
    try {
      const { data } = await api.put(`/transactions/${id}`, { status });
      setTransactions(transactions.map(tx => tx._id === id ? data.data : tx));
      setMsg(`Pickup marked as ${status}`);
      if (status === 'Completed') reloadUser();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update status');
    }
    setActionId(null);
    setTimeout(() => setMsg(''), 4000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Pickup History</h1>
          <p className="subtitle">Track and manage your claimed pickups and active transactions.</p>
        </div>
      </div>
      
      {msg && <div className="success">{msg}</div>}
      
      {loading ? (
        <div className="spinner-center"><div className="spinner-lg"></div></div>
      ) : transactions.length === 0 ? (
        <div className="empty-state">No transaction history found.</div>
      ) : (
        <div className="listing-grid">
          {transactions.map(tx => {
            const isBuyer = tx.buyer?._id === user?.id;
            const otherParty = isBuyer ? tx.seller : tx.buyer;
            const roleText = isBuyer ? 'Seller' : 'Buyer';
            
            return (
              <div key={tx._id} className="listing-card">
                <div className="listing-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="cat-tag">{tx.category?.name || 'Uncategorized'}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[tx.status] || '#666' }}>
                      {tx.status}
                    </span>
                  </div>
                  <h3>{tx.listing?.title || 'Unknown Listing'}</h3>
                  <p className="listing-desc">Weight: {tx.weight} {tx.unit}</p>
                  
                  <div className="listing-meta" style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span>Amount: <strong>৳{tx.totalAmount.toFixed(2)}</strong></span>
                    <span>{roleText}: {otherParty?.name || 'Unknown'}</span>
                    <span>Earned: {tx.pointsEarned} EcoPoints</span>
                  </div>

                  {!['Completed', 'Cancelled'].includes(tx.status) && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <button 
                        onClick={() => updateStatus(tx._id, 'Completed')} 
                        style={{ flex: 1, background: '#10b981' }}
                        disabled={actionId === tx._id}
                      >
                        {actionId === tx._id ? '...' : 'Mark Completed'}
                      </button>
                      <button 
                        onClick={() => { if(window.confirm('Cancel this pickup?')) updateStatus(tx._id, 'Cancelled'); }} 
                        style={{ background: '#ef4444', flex: 1 }}
                        disabled={actionId === tx._id}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {tx.status === 'Completed' && !ratedIds.includes(tx._id) && (
                    <button onClick={() => setRateTx(tx)} style={{ marginTop: 12, width: '100%', background: '#7c3aed' }}>
                      Rate this pickup
                    </button>
                  )}
                  {tx.status === 'Completed' && ratedIds.includes(tx._id) && (
                    <p style={{ fontSize: 12, color: '#16a34a', marginTop: 10, textAlign: 'center' }}>✔ Rated</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!rateTx} onClose={() => setRateTx(null)} title="Rate this pickup">
        <p style={{ color: '#666', marginBottom: 12 }}>How was the collection experience with {rateTx?.buyer?._id === user?.id ? rateTx?.seller?.name : rateTx?.buyer?.name}?</p>
        <div style={{ display: 'flex', gap: 4, fontSize: 28, marginBottom: 12 }}>
          {[1,2,3,4,5].map(star => (
            <button key={star} onClick={() => setRating(star)} style={{ background: 'none', boxShadow: 'none', padding: 0, margin: 0, fontSize: 28, color: star <= rating ? '#f59e0b' : '#d1d5db' }}>★</button>
          ))}
        </div>
        <label>Comment</label>
        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)} placeholder="e.g. Pickup was on time." style={{ resize: 'none', padding: '11px 13px', border: '1px solid #d6dbd9', borderRadius: 8, fontSize: 14, width: '100%', marginBottom: 16 }} />
        <button onClick={submitFeedback}>Submit Rating</button>
      </Modal>
    </div>
  );
};

export default Transactions;
