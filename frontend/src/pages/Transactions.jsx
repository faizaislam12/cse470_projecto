import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Transactions;
