// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../api/axios';
// import Modal from '../components/Modal';
// import StarRating from '../components/StarRating';

// const TransactionHistory = () => {
//   const { reloadUser } = useAuth();
//   const [txs, setTxs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState('');
  
//   const [fbModal, setFbModal] = useState(false);
//   const [selectedTx, setSelectedTx] = useState(null);
//   const [rating, setRating] = useState(5);
//   const [comment, setComment] = useState('');
//   const [fbError, setFbError] = useState('');

//   const [negoModal, setNegoModal] = useState(false);
//   const [offerAmount, setOfferAmount] = useState('');
//   const [schedDate, setSchedDate] = useState('');

//   useEffect(() => { fetchTxs(); }, []);
//   const fetchTxs = async () => { setLoading(true); try { const {data} = await api.get('/transactions'); setTxs(data.data); } catch {} setLoading(false); };
  
//   const updateStatus = async (id, status, extra = {}) => {
//     try {
//       const {data} = await api.put(`/transactions/${id}`, { status, ...extra });
//       setTxs(txs.map(t => t._id === id ? data.data : t));
//       setMsg(`Transaction updated successfully!`);
//       if (status === 'Completed') reloadUser();
//       setNegoModal(false);
//     } catch (err) { setMsg(err.response?.data?.message || 'Failed'); }
//     setTimeout(() => setMsg(''), 4000);
//   };

//   const openFeedback = (tx) => { setSelectedTx(tx); setRating(5); setComment(''); setFbError(''); setFbModal(true); };
//   const submitFeedback = async (e) => {
//     e.preventDefault();
//     if (!comment.trim()) { setFbError('Comment required'); return; }
//     try {
//       await api.post('/feedback', { transactionId: selectedTx._id, rating, comment });
//       setMsg('Feedback submitted!'); setFbModal(false);
//     } catch (err) { setFbError(err.response?.data?.message || 'Failed'); }
//     setTimeout(() => setMsg(''), 4000);
//   };

//   const openNego = (tx) => { setSelectedTx(tx); setOfferAmount(tx.offeredAmount || tx.totalAmount); setSchedDate(''); setNegoModal(true); };

//   const STATUS_COLORS = { Pending: '#f59e0b', Negotiating: '#8b5cf6', Scheduled: '#3b82f6', Completed: '#10b981', Cancelled: '#ef4444' };

//   return (
//     <div className="page-container">
//       <h1>Transaction History</h1>
//       <p className="subtitle">Track pickup orders, negotiate offers, and leave feedback.</p>
//       {msg && <div className="success">{msg}</div>}
//       {loading ? <div className="spinner-center"><div className="spinner-lg"></div></div> :
//         txs.length === 0 ? <div className="empty-state">No transactions yet.</div> :
//         <div className="tx-list">
//           {txs.map(tx => (
//             <div key={tx._id} className="tx-card" style={{borderLeftColor: STATUS_COLORS[tx.status]}}>
//               <div className="tx-top">
//                 <div><small>📅 {new Date(tx.transactionDate || tx.createdAt).toLocaleDateString()}</small><h3>{tx.listing?.title || 'Recyclable Item'}</h3></div>
//                 <span className={`status-badge`} style={{background:`${STATUS_COLORS[tx.status]}20`, color: STATUS_COLORS[tx.status]}}>{tx.status}</span>
//               </div>
//               <div className="tx-details">
//                 <div><small>Seller</small><strong>{tx.seller?.name}</strong></div>
//                 <div><small>Buyer</small><strong>{tx.buyer?.name}</strong></div>
//                 <div><small>Category</small><strong>{tx.category?.name}</strong></div>
//                 <div><small>Weight</small><strong>{tx.weight} {tx.unit}</strong></div>
//                 <div><small>Amount {tx.offeredAmount ? '(Offered)' : ''}</small><strong>${(tx.offeredAmount || tx.totalAmount)?.toFixed(2)}</strong></div>
//                 <div><small>EcoPoints</small><strong style={{color:'#10b981'}}>+{tx.pointsEarned}</strong></div>
//                 {tx.scheduledDate && <div><small>Scheduled</small><strong>{new Date(tx.scheduledDate).toLocaleDateString()}</strong></div>}
//               </div>

//               {tx.history && tx.history.length > 0 && (
//                 <div style={{marginTop: 12, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 12}}>
//                   <strong style={{display:'block', marginBottom: 4}}>History:</strong>
//                   {tx.history.map((h, i) => (
//                     <div key={i} style={{color: '#555', marginBottom: 2}}>
//                       • {new Date(h.date).toLocaleDateString()}: <strong>{h.action}</strong> {h.amount ? `for $${h.amount.toFixed(2)}` : ''}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               <div className="tx-actions">
//                 {['Pending', 'Negotiating'].includes(tx.status) && (
//                   <>
//                     <button onClick={() => updateStatus(tx._id, 'Cancelled')} style={{background:'#ef4444'}}>Cancel</button>
//                     <button onClick={() => openNego(tx)} style={{background:'#8b5cf6'}}>Negotiate / Schedule</button>
//                   </>
//                 )}
//                 {tx.status === 'Scheduled' && (
//                   <button onClick={() => updateStatus(tx._id, 'Completed')}>Mark as Completed</button>
//                 )}
//                 {tx.status === 'Completed' && (
//                   <button onClick={() => openFeedback(tx)} style={{background:'#06b6d4'}}>Leave Feedback</button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       }

//       <Modal isOpen={fbModal} onClose={() => setFbModal(false)} title="Leave Feedback">
//         {fbError && <div className="error">{fbError}</div>}
//         <form onSubmit={submitFeedback}>
//           <div style={{textAlign:'center',margin:'16px 0'}}><label style={{marginBottom:8,display:'block'}}>Rate your experience</label><div style={{display:'flex',justifyContent:'center'}}><StarRating rating={rating} setRating={setRating} size={32} /></div></div>
//           <label>Comment<textarea required rows={4} value={comment} onChange={e => setComment(e.target.value)} style={{resize:'none',padding:'11px 13px',border:'1px solid #d6dbd9',borderRadius:8,fontSize:14}} /></label>
//           <button type="submit">Submit Review</button>
//         </form>
//       </Modal>

//       <Modal isOpen={negoModal} onClose={() => setNegoModal(false)} title="Manage Transaction">
//         <form onSubmit={(e) => { e.preventDefault(); updateStatus(selectedTx._id, 'Negotiating', { offeredAmount: offerAmount }); }}>
//           <label>Counter Offer ($)<input type="number" step="any" required value={offerAmount} onChange={e => setOfferAmount(e.target.value)} /></label>
//           <button type="submit" style={{background:'#8b5cf6', width:'100%', marginBottom: 16}}>Send Counter Offer</button>
//         </form>
//         <hr style={{margin:'16px 0', borderColor:'#e5e7eb', border:'none', borderTop:'1px solid #e5e7eb'}} />
//         <form onSubmit={(e) => { e.preventDefault(); updateStatus(selectedTx._id, 'Scheduled', { scheduledDate: schedDate }); }}>
//           <label>Schedule Pickup Date<input type="date" required value={schedDate} onChange={e => setSchedDate(e.target.value)} /></label>
//           <button type="submit" style={{width:'100%'}}>Accept & Schedule Pickup</button>
//         </form>
//       </Modal>
//     </div>
//   );
// };
// export default TransactionHistory;
